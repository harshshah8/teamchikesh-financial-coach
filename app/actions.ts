"use server";

import { EventStatus, EventType, ExpenseType, PaymentMode, TransactionDirection, TransactionSource, Treatment, UploadStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AUTH_COOKIE, hasValidPasscode } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentMonthKey } from "@/lib/formatting/dates";
import { getEventSummary } from "@/lib/calculations/event";
import { formatMoney } from "@/lib/formatting/money";
import { classifyStatementRow, parseStatementFile } from "@/lib/parsing/statement";

export async function login(_: unknown, formData: FormData) {
  const passcode = String(formData.get("passcode") ?? "");

  if (!hasValidPasscode(passcode)) {
    return { error: "That passcode did not work." };
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, "ok", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/"
  });

  redirect("/");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete(AUTH_COOKIE);
  redirect("/login");
}

export async function createEvent(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const type = String(formData.get("type") ?? "TRIP") as EventType;
  const startDate = String(formData.get("startDate") ?? "");
  const budget = String(formData.get("budget") ?? "");

  if (!name) return;

  const event = await prisma.event.create({
    data: {
      name,
      type,
      startDate: startDate ? new Date(startDate) : null,
      budget: budget ? Number(budget) : null
    }
  });

  revalidatePath("/events");
  redirect(`/events/${event.id}`);
}

export async function addEventExpense(formData: FormData) {
  const eventId = String(formData.get("eventId"));
  const ownerId = String(formData.get("ownerId"));
  const amount = Number(formData.get("amount"));
  const category = String(formData.get("category") ?? "Other");
  const paymentMode = String(formData.get("paymentMode") ?? "OTHER") as PaymentMode;
  const date = String(formData.get("date") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!eventId || !ownerId || !amount) return;

  const event = await prisma.event.findUnique({ where: { id: eventId }, select: { status: true } });
  if (event?.status !== EventStatus.ACTIVE) {
    revalidatePath(`/events/${eventId}`);
    return;
  }

  await prisma.transaction.create({
    data: {
      eventId,
      ownerId,
      amount,
      category,
      paymentMode,
      date: date ? new Date(date) : new Date(),
      description: notes || category,
      notes,
      direction: TransactionDirection.DEBIT,
      treatment: Treatment.EXPENSE,
      expenseType: ExpenseType.TRAVEL,
      source: TransactionSource.MANUAL_EVENT
    }
  });

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/");
}

export async function endEvent(formData: FormData) {
  const eventId = String(formData.get("eventId"));
  const summary = await getEventSummary(eventId);
  const aiSummary =
    summary && summary.total > 0
      ? buildEventSummaryText(summary.event.name, summary.total, summary.transactionCount)
      : "Event ended. Add expenses to generate a useful summary.";

  await prisma.event.update({
    where: { id: eventId },
    data: {
      status: EventStatus.ENDED,
      endDate: new Date(),
      aiSummary
    }
  });

  revalidatePath(`/events/${eventId}`);
  revalidatePath("/events");
}

function buildEventSummaryText(eventName: string, total: number, transactionCount: number) {
  return `${eventName} has total tracked spend of ${formatMoney(total)} across ${transactionCount} expense entries.`;
}

export async function addWealthRecord(formData: FormData) {
  const ownerId = String(formData.get("ownerId"));
  const month = String(formData.get("month") ?? currentMonthKey());
  const recordType = String(formData.get("recordType") ?? "Wealth Snapshot");
  const assetType = String(formData.get("assetType") ?? "").trim();
  const platform = String(formData.get("platform") ?? "").trim();
  const amount = Number(formData.get("amount"));
  const isLiability = formData.get("isLiability") === "on" || recordType === "Liability";
  const notes = String(formData.get("notes") ?? "").trim();

  if (!ownerId || !assetType || !amount) return;

  await prisma.wealthRecord.create({
    data: {
      ownerId,
      month,
      recordType,
      assetType,
      platform,
      amount,
      isLiability,
      notes
    }
  });

  revalidatePath("/records");
  revalidatePath("/");
}

export async function addManualRecord(formData: FormData) {
  const ownerId = String(formData.get("ownerId"));
  const recordType = String(formData.get("recordType") ?? "Manual Expense");
  const category = String(formData.get("category") ?? "Other");
  const amount = Number(formData.get("amount"));
  const date = String(formData.get("date") ?? "");
  const notes = String(formData.get("notes") ?? "").trim();

  if (!ownerId || !amount) return;

  const treatment =
    recordType === "Income"
      ? Treatment.INCOME
      : recordType === "Investment Update"
        ? Treatment.INVESTMENT
        : recordType === "Transfer"
          ? Treatment.TRANSFER
          : recordType === "Refund"
            ? Treatment.REFUND
            : Treatment.EXPENSE;

  await prisma.transaction.create({
    data: {
      ownerId,
      amount,
      category,
      date: date ? new Date(date) : new Date(),
      description: notes || recordType,
      notes,
      direction: treatment === Treatment.INCOME || treatment === Treatment.REFUND ? TransactionDirection.CREDIT : TransactionDirection.DEBIT,
      treatment,
      source: TransactionSource.MANUAL_RECORD
    }
  });

  revalidatePath("/records");
  revalidatePath("/");
  revalidatePath("/reports");
}

export async function uploadStatement(formData: FormData) {
  const ownerId = String(formData.get("ownerId") ?? "");
  const accountId = String(formData.get("accountId") ?? "");
  const month = String(formData.get("month") ?? currentMonthKey());
  const file = formData.get("file");

  if (!ownerId || !accountId || !(file instanceof File) || file.size === 0) {
    return;
  }

  const account = await prisma.account.findFirst({
    where: { id: accountId, ownerId }
  });

  if (!account) return;

  const upload = await prisma.statementUpload.create({
    data: {
      ownerId,
      accountId,
      month,
      fileName: file.name,
      fileType: file.type || file.name.split(".").pop() || "unknown",
      status: UploadStatus.UPLOADED
    }
  });

  try {
    const [rows, rules] = await Promise.all([
      parseStatementFile(file),
      prisma.rule.findMany({ orderBy: { priority: "asc" } })
    ]);

    if (!rows.length) {
      await prisma.statementUpload.update({
        where: { id: upload.id },
        data: { status: UploadStatus.FAILED, processedAt: new Date() }
      });
      redirect(`/upload?uploadId=${upload.id}`);
    }

    let needsReview = false;

    for (const row of rows) {
      const classified = classifyStatementRow({ row, accountType: account.type, rules });
      if (classified.treatment === Treatment.UNKNOWN || classified.confidence < 0.7) {
        needsReview = true;
      }

      const transaction = await prisma.transaction.create({
        data: {
          date: classified.date,
          ownerId,
          accountId,
          amount: classified.amount,
          direction: classified.direction,
          description: classified.description,
          merchant: classified.merchant,
          category: classified.category,
          subcategory: classified.subcategory,
          treatment: classified.treatment,
          expenseType: classified.expenseType,
          paymentMode: classified.paymentMode,
          source: TransactionSource.STATEMENT,
          sourceFileId: upload.id,
          confidence: classified.confidence,
          notes: classified.reason
        }
      });

      if (classified.treatment === Treatment.EXPENSE) {
        await markManualEventDuplicate({
          ownerId,
          amount: classified.amount,
          date: classified.date,
          statementTransactionId: transaction.id,
          statementCategory: classified.category
        });
      }
    }

    await prisma.statementUpload.update({
      where: { id: upload.id },
      data: {
        status: needsReview ? UploadStatus.NEEDS_REVIEW : UploadStatus.COMPLETED,
        processedAt: new Date()
      }
    });
  } catch {
    await prisma.statementUpload.update({
      where: { id: upload.id },
      data: { status: UploadStatus.FAILED, processedAt: new Date() }
    });
  }

  revalidatePath("/upload");
  revalidatePath("/");
  revalidatePath("/reports");
  redirect(`/upload?uploadId=${upload.id}`);
}

async function markManualEventDuplicate({
  ownerId,
  amount,
  date,
  statementTransactionId,
  statementCategory
}: {
  ownerId: string;
  amount: number;
  date: Date;
  statementTransactionId: string;
  statementCategory: string;
}) {
  const start = new Date(date);
  start.setDate(start.getDate() - 2);
  const end = new Date(date);
  end.setDate(end.getDate() + 2);

  const manualMatch = await prisma.transaction.findFirst({
    where: {
      ownerId,
      amount,
      date: { gte: start, lte: end },
      source: TransactionSource.MANUAL_EVENT,
      treatment: Treatment.EXPENSE,
      duplicateOfTransactionId: null
    },
    orderBy: { createdAt: "desc" }
  });

  if (!manualMatch) return;

  await prisma.transaction.update({
    where: { id: statementTransactionId },
    data: {
      eventId: manualMatch.eventId,
      category: statementCategory || manualMatch.category
    }
  });

  await prisma.transaction.update({
    where: { id: manualMatch.id },
    data: {
      treatment: Treatment.DUPLICATE,
      duplicateOfTransactionId: statementTransactionId,
      notes: manualMatch.notes ? `${manualMatch.notes}\nMatched with statement upload.` : "Matched with statement upload."
    }
  });
}

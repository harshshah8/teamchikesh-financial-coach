"use server";

import { EventStatus, EventType, ExpenseType, PaymentMode, TransactionDirection, TransactionSource, Treatment } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { AUTH_COOKIE, hasValidPasscode } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { currentMonthKey } from "@/lib/formatting/dates";
import { getEventSummary } from "@/lib/calculations/event";

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
      ? `${summary.event.name} ended with total tracked spend of ${summary.total.toFixed(0)} across ${summary.transactionCount} expense entries.`
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

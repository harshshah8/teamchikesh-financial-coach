import { Treatment } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/formatting/money";
import { formatShortDate } from "@/lib/formatting/dates";

export async function getEventSummary(eventId: string) {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      transactions: {
        where: {
          treatment: Treatment.EXPENSE,
          duplicateOfTransactionId: null
        },
        include: { owner: true },
        orderBy: { date: "asc" }
      }
    }
  });

  if (!event) return null;

  const total = event.transactions.reduce((sum, txn) => sum + toNumber(txn.amount), 0);
  const byOwner = new Map<string, number>();
  const byCategory = new Map<string, number>();
  const byDate = new Map<string, number>();
  const byPaymentMode = new Map<string, number>();

  for (const txn of event.transactions) {
    const amount = toNumber(txn.amount);
    byOwner.set(txn.owner.name, (byOwner.get(txn.owner.name) ?? 0) + amount);
    byCategory.set(txn.category ?? "Other", (byCategory.get(txn.category ?? "Other") ?? 0) + amount);
    byDate.set(formatShortDate(txn.date), (byDate.get(formatShortDate(txn.date)) ?? 0) + amount);
    byPaymentMode.set(txn.paymentMode ?? "OTHER", (byPaymentMode.get(txn.paymentMode ?? "OTHER") ?? 0) + amount);
  }

  return {
    event,
    total,
    transactionCount: event.transactions.length,
    byOwner: Array.from(byOwner, ([name, value]) => ({ name, value })),
    byCategory: Array.from(byCategory, ([name, value]) => ({ name, value })),
    byDate: Array.from(byDate, ([name, value]) => ({ name, value })),
    byPaymentMode: Array.from(byPaymentMode, ([name, value]) => ({ name, value }))
  };
}

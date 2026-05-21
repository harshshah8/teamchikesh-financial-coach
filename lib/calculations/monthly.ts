import { Treatment } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { monthRange } from "@/lib/formatting/dates";
import { toNumber } from "@/lib/formatting/money";

export async function getMonthlySummary(month: string) {
  const { start, end } = monthRange(month);

  const transactions = await prisma.transaction.findMany({
    where: {
      date: { gte: start, lt: end },
      duplicateOfTransactionId: null
    },
    include: { owner: true, event: true }
  });

  const income = sumByTreatment(transactions, Treatment.INCOME);
  const expenses = sumByTreatment(transactions, Treatment.EXPENSE);
  const investments = sumByTreatment(transactions, Treatment.INVESTMENT);
  const creditCardPaymentsIgnored = sumByTreatment(transactions, Treatment.CREDIT_CARD_PAYMENT);
  const savingsRate = income > 0 ? ((income - expenses) / income) * 100 : 0;
  const investmentRate = income > 0 ? (investments / income) * 100 : 0;

  const byCategory = new Map<string, number>();
  for (const txn of transactions.filter((txn) => txn.treatment === Treatment.EXPENSE)) {
    byCategory.set(txn.category ?? "Other", (byCategory.get(txn.category ?? "Other") ?? 0) + toNumber(txn.amount));
  }

  return {
    month,
    income,
    expenses,
    investments,
    savingsRate,
    investmentRate,
    creditCardPaymentsIgnored,
    byCategory: Array.from(byCategory, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value)
  };
}

function sumByTreatment(transactions: Awaited<ReturnType<typeof prisma.transaction.findMany>>, treatment: Treatment) {
  return transactions
    .filter((txn) => txn.treatment === treatment)
    .reduce((sum, txn) => sum + toNumber(txn.amount), 0);
}

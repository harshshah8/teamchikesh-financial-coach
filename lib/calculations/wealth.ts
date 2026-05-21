import { prisma } from "@/lib/prisma";
import { toNumber } from "@/lib/formatting/money";

export async function getWealthSummary(month?: string) {
  const records = await prisma.wealthRecord.findMany({
    where: month ? { month } : undefined,
    include: { owner: true },
    orderBy: { createdAt: "desc" }
  });

  const assets = records.filter((record) => !record.isLiability).reduce((sum, record) => sum + toNumber(record.amount), 0);
  const liabilities = records.filter((record) => record.isLiability).reduce((sum, record) => sum + toNumber(record.amount), 0);

  return {
    assets,
    liabilities,
    netWorth: assets - liabilities,
    records
  };
}

import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const [wealthRecords, transactions] = await Promise.all([
    prisma.wealthRecord.findMany({ include: { owner: true }, orderBy: { createdAt: "desc" } }),
    prisma.transaction.findMany({ include: { owner: true }, orderBy: { createdAt: "desc" }, take: 50 })
  ]);

  return NextResponse.json({ wealthRecords, transactions });
}

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEventSummary } from "@/lib/calculations/event";
import { getMonthlySummary } from "@/lib/calculations/monthly";
import { getWealthSummary } from "@/lib/calculations/wealth";
import { currentMonthKey } from "@/lib/formatting/dates";
import { formatMoney } from "@/lib/formatting/money";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const question = String(body.question ?? "").trim();

  if (!question) {
    return NextResponse.json({ answer: "Ask me a finance question." }, { status: 400 });
  }

  const lower = question.toLowerCase();

  if (lower.includes("trip") || lower.includes("goa") || lower.includes("event") || lower.includes("cost")) {
    const events = await prisma.event.findMany({ orderBy: { createdAt: "desc" } });
    const event =
      events.find((item) => lower.includes(item.name.toLowerCase())) ??
      events.find((item) => item.name.toLowerCase().split(/\s|-/).some((part) => part.length > 2 && lower.includes(part))) ??
      events[0];

    if (!event) {
      return NextResponse.json({ answer: "I do not have an event yet. Create a trip or event and add expenses first." });
    }

    const summary = await getEventSummary(event.id);
    if (!summary) {
      return NextResponse.json({ answer: "I could not find that event." }, { status: 404 });
    }

    return NextResponse.json({
      answer: `${summary.event.name} cost ${formatMoney(summary.total)} across ${summary.transactionCount} expense entries. ${ownerSentence(summary.byOwner)} Credit card payments and duplicates are not included in this total.`,
      data: {
        intent: "EVENT_SUMMARY",
        eventId: event.id,
        total: summary.total,
        byOwner: summary.byOwner,
        byCategory: summary.byCategory,
        byDate: summary.byDate,
        byPaymentMode: summary.byPaymentMode
      }
    });
  }

  if (lower.includes("net worth")) {
    const wealth = await getWealthSummary(currentMonthKey());
    return NextResponse.json({
      answer: `Current month net worth is ${formatMoney(wealth.netWorth)}. Assets are ${formatMoney(wealth.assets)} and liabilities are ${formatMoney(wealth.liabilities)}.`,
      data: { intent: "NET_WORTH", ...wealth }
    });
  }

  const monthly = await getMonthlySummary(currentMonthKey());
  return NextResponse.json({
    answer: `For ${monthly.month}, income is ${formatMoney(monthly.income)}, expenses are ${formatMoney(monthly.expenses)}, and investments are ${formatMoney(monthly.investments)}. Savings rate is ${monthly.savingsRate.toFixed(0)}%.`,
    data: { intent: "MONTHLY_SUMMARY", ...monthly }
  });
}

function ownerSentence(byOwner: { name: string; value: number }[]) {
  if (!byOwner.length) return "No paid-by split is available yet.";
  return byOwner.map((item) => `${item.name} paid ${formatMoney(item.value)}`).join("; ") + ".";
}

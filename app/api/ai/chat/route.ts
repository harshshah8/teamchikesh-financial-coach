import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEventSummary } from "@/lib/calculations/event";
import { getMonthlySummary } from "@/lib/calculations/monthly";
import { getWealthSummary } from "@/lib/calculations/wealth";
import { currentMonthKey } from "@/lib/formatting/dates";
import { formatMoney } from "@/lib/formatting/money";
import { detectCoachIntent } from "@/lib/ai/intent";
import { generateCoachText } from "@/lib/ai/openai";
import { coachSystemPrompt } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const question = String(body.question ?? "").trim();

  if (!question) {
    return NextResponse.json({ answer: "Ask me a finance question." }, { status: 400 });
  }

  const lower = question.toLowerCase();
  const intent = detectCoachIntent(question);

  if (intent === "GREETING") {
    return NextResponse.json({
      answer: "Hi. I can help with your trips, spending, net worth, records, monthly reports, and finance questions.",
      data: { intent }
    });
  }

  if (intent === "DATE") {
    const today = new Intl.DateTimeFormat("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric"
    }).format(new Date());
    return NextResponse.json({
      answer: `Today is ${today}.`,
      data: { intent }
    });
  }

  if (intent === "WEATHER") {
    return NextResponse.json({
      answer: "I cannot help with weather here. I can help with expenses, trips, net worth, investments, records, and monthly reports.",
      data: { intent }
    });
  }

  if (intent === "OUT_OF_SCOPE") {
    return NextResponse.json({
      answer: "I am focused on your personal finances. Ask me about spending, trips, net worth, investments, records, savings, or monthly reports.",
      data: { intent }
    });
  }

  if (intent === "EVENT_SUMMARY") {
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

    const fallbackAnswer = `${summary.event.name} cost ${formatMoney(summary.total)} across ${summary.transactionCount} expense entries. ${ownerSentence(summary.byOwner)} Credit card payments and duplicates are not included in this total.`;
    const answer = await explainWithAi({
      question,
      fallbackAnswer,
      facts: {
        intent,
        eventName: summary.event.name,
        total: summary.total,
        transactionCount: summary.transactionCount,
        byOwner: summary.byOwner,
        byCategory: summary.byCategory,
        byDate: summary.byDate,
        byPaymentMode: summary.byPaymentMode
      }
    });

    return NextResponse.json({
      answer,
      data: {
        intent,
        eventId: event.id,
        total: summary.total,
        byOwner: summary.byOwner,
        byCategory: summary.byCategory,
        byDate: summary.byDate,
        byPaymentMode: summary.byPaymentMode
      }
    });
  }

  if (intent === "NET_WORTH") {
    const wealth = await getWealthSummary(currentMonthKey());
    const fallbackAnswer = `Current month net worth is ${formatMoney(wealth.netWorth)}. Assets are ${formatMoney(wealth.assets)} and liabilities are ${formatMoney(wealth.liabilities)}.`;
    const answer = await explainWithAi({ question, fallbackAnswer, facts: { intent, ...wealth } });

    return NextResponse.json({
      answer,
      data: { intent, ...wealth }
    });
  }

  const monthly = await getMonthlySummary(currentMonthKey());
  const wealth = await getWealthSummary(currentMonthKey());
  const fallbackAnswer = `For ${monthly.month}, income is ${formatMoney(monthly.income)}, expenses are ${formatMoney(monthly.expenses)}, and investments are ${formatMoney(monthly.investments)}. Savings rate is ${monthly.savingsRate.toFixed(0)}%.`;
  const answer = await explainWithAi({
    question,
    fallbackAnswer,
    facts: {
      intent,
      monthly,
      wealth: {
        assets: wealth.assets,
        liabilities: wealth.liabilities,
        netWorth: wealth.netWorth
      }
    }
  });

  return NextResponse.json({
    answer,
    data: { intent, ...monthly }
  });
}

function ownerSentence(byOwner: { name: string; value: number }[]) {
  if (!byOwner.length) return "No paid-by split is available yet.";
  return byOwner.map((item) => `${item.name} paid ${formatMoney(item.value)}`).join("; ") + ".";
}

async function explainWithAi({
  question,
  facts,
  fallbackAnswer
}: {
  question: string;
  facts: unknown;
  fallbackAnswer: string;
}) {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackAnswer;
  }

  return generateCoachText({
    system: coachSystemPrompt,
    prompt: JSON.stringify(
      {
        task: "Answer the user's finance question concisely. Use only the calculated facts. Do not invent missing amounts. Mention missing data when relevant.",
        question,
        calculatedFacts: facts
      },
      null,
      2
    )
  });
}

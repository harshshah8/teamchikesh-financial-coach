import { NextRequest, NextResponse } from "next/server";
import { getMonthlySummary } from "@/lib/calculations/monthly";
import { getWealthSummary } from "@/lib/calculations/wealth";
import { currentMonthKey } from "@/lib/formatting/dates";
import { generateCoachText } from "@/lib/ai/openai";
import { coachSystemPrompt } from "@/lib/ai/prompts";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const month = String(body.month ?? currentMonthKey());
  const [monthly, wealth] = await Promise.all([getMonthlySummary(month), getWealthSummary(month)]);

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      {
        error: "OPENAI_API_KEY is not configured. Add it to .env.local, restart the dev server, then generate the AI summary.",
        facts: { monthly, wealth }
      },
      { status: 503 }
    );
  }

  const prompt = JSON.stringify(
    {
      task: "Write a concise monthly financial report for Harsh and Anubhuti. Use only these calculated facts. Include an executive summary, what changed, categories to watch, and 2-3 practical action items.",
      month,
      calculatedFacts: {
        income: monthly.income,
        expenses: monthly.expenses,
        investments: monthly.investments,
        savingsRate: monthly.savingsRate,
        investmentRate: monthly.investmentRate,
        creditCardPaymentsIgnored: monthly.creditCardPaymentsIgnored,
        topCategories: monthly.byCategory,
        netWorth: wealth.netWorth,
        assets: wealth.assets,
        liabilities: wealth.liabilities
      }
    },
    null,
    2
  );

  try {
    const summary = await generateCoachText({ system: coachSystemPrompt, prompt });

    return NextResponse.json({
      summary,
      facts: { monthly, wealth }
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown OpenAI error";
    return NextResponse.json(
      {
        error: `OpenAI request failed: ${message}`,
        facts: { monthly, wealth }
      },
      { status: 502 }
    );
  }
}

import OpenAI from "openai";

export function getOpenAIClient() {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is missing. Add it to .env.local before using AI generation.");
  }

  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function generateCoachText({ system, prompt }: { system: string; prompt: string }) {
  const client = getOpenAIClient();
  const response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || "gpt-5.5-mini",
    messages: [
      { role: "system", content: system },
      { role: "user", content: prompt }
    ]
  });

  return response.choices[0]?.message.content ?? "";
}

"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";

export function MonthlyAiSummary({ month }: { month: string }) {
  const [summary, setSummary] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function generateSummary() {
    setPending(true);
    setError("");
    setSummary("");

    const response = await fetch("/api/ai/monthly-summary", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ month })
    });
    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Could not generate AI summary.");
    } else {
      setSummary(data.summary ?? "");
    }

    setPending(false);
  }

  return (
    <section className="mt-5 px-4">
      <div className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="font-semibold">AI Monthly Summary</h2>
            <p className="mt-1 text-sm text-ink/60">The app sends calculated totals to the LLM only when you tap generate.</p>
          </div>
          <button
            onClick={generateSummary}
            disabled={pending}
            className="flex h-11 items-center gap-2 rounded-md bg-ink px-3 text-sm font-medium text-white disabled:opacity-60"
          >
            <Sparkles size={17} />
            {pending ? "Generating" : "Generate"}
          </button>
        </div>
        {error ? <p className="mt-4 rounded-md bg-clay/10 p-3 text-sm text-clay">{error}</p> : null}
        {summary ? <p className="mt-4 whitespace-pre-wrap rounded-md bg-paper p-3 text-sm leading-6 text-ink">{summary}</p> : null}
      </div>
    </section>
  );
}

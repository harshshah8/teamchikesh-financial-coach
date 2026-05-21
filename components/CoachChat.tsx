"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";

const suggestions = [
  "How much did Goa trip cost?",
  "How much did we spend this month?",
  "What is our net worth?",
  "Are we saving enough?"
];

export function CoachChat() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "coach"; text: string }[]>([]);
  const [pending, setPending] = useState(false);

  async function ask(nextQuestion: string) {
    const trimmed = nextQuestion.trim();
    if (!trimmed) return;

    setPending(true);
    setQuestion("");
    setMessages((current) => [...current, { role: "user", text: trimmed }]);

    const response = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question: trimmed })
    });
    const data = await response.json();

    setMessages((current) => [...current, { role: "coach", text: data.answer ?? "I could not answer that yet." }]);
    setPending(false);
  }

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void ask(question);
  }

  return (
    <section className="px-4">
      <div className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
        <div className="flex flex-wrap gap-2">
          {suggestions.map((item) => (
            <button key={item} onClick={() => ask(item)} className="interactive-button rounded-md bg-mint px-3 py-2 text-left text-sm font-medium text-ink">
              {item}
            </button>
          ))}
        </div>

        <div className="mt-5 min-h-72 space-y-3">
          {messages.length ? (
            messages.map((message, index) => (
              <div key={`${message.role}-${index}`} className={message.role === "user" ? "text-right" : "text-left"}>
                <p className={`inline-block max-w-[85%] rounded-lg px-3 py-2 text-sm ${message.role === "user" ? "bg-ink text-white" : "bg-paper text-ink"}`}>
                  {message.text}
                </p>
              </div>
            ))
          ) : (
            <p className="text-sm text-ink/55">Ask about trip cost, monthly spend, net worth, or savings rate.</p>
          )}
        </div>

        <form onSubmit={onSubmit} className="mt-4 flex gap-2">
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask Coach"
            className="h-12 min-w-0 flex-1 rounded-md border border-black/15 px-3"
          />
          <button className="interactive-button flex h-12 w-12 items-center justify-center rounded-md bg-ink text-white" disabled={pending} aria-label="Ask">
            <Send size={18} />
          </button>
        </form>
      </div>
    </section>
  );
}

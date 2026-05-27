"use client";

import { useActionState, useEffect, useRef } from "react";
import { addEventExpenseFeedback } from "@/app/actions";
import { useCelebration } from "@/components/Celebration";

type Person = {
  id: string;
  name: string;
};

const initialState = {
  ok: false,
  message: "",
  nonce: 0
};

export function EventExpenseForm({
  eventId,
  users,
  categories,
  paymentModes
}: {
  eventId: string;
  users: Person[];
  categories: string[];
  paymentModes: string[];
}) {
  const [state, action, pending] = useActionState(addEventExpenseFeedback, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const { celebrate, confetti } = useCelebration();

  useEffect(() => {
    if (!state.message || !state.nonce) return;
    if (state.ok) {
      celebrate("success");
      formRef.current?.reset();
    }
  }, [celebrate, state]);

  return (
    <section className="mt-5 px-4">
      {confetti}
      <form ref={formRef} action={action} className="rounded-lg border border-black/10 bg-white p-4 shadow-soft">
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="font-semibold">Add Expense</h2>
          {state.message ? (
            <span className={`rounded-md px-2 py-1 text-xs font-medium ${state.ok ? "bg-mint text-ink" : "bg-clay/10 text-clay"}`}>
              {state.message}
            </span>
          ) : null}
        </div>
        <input type="hidden" name="eventId" value={eventId} />
        <div className="grid gap-3">
          <select name="ownerId" className="h-12 rounded-md border border-black/15 px-3" required>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          <input name="amount" inputMode="decimal" placeholder="Amount" className="h-12 rounded-md border border-black/15 px-3" required />
          <div className="grid grid-cols-2 gap-3">
            <select name="category" className="h-12 rounded-md border border-black/15 px-3" defaultValue="Food">
              {categories.map((category) => (
                <option key={category}>{category}</option>
              ))}
            </select>
            <select name="paymentMode" className="h-12 rounded-md border border-black/15 px-3" defaultValue="UPI">
              {paymentModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode.replaceAll("_", " ")}
                </option>
              ))}
            </select>
          </div>
          <input name="date" type="date" className="h-12 rounded-md border border-black/15 px-3" />
          <textarea name="notes" placeholder="Notes" className="min-h-24 rounded-md border border-black/15 p-3" />
          <button className="interactive-button h-12 rounded-md bg-ink font-medium text-white" disabled={pending}>
            {pending ? "Saving..." : "Save Expense"}
          </button>
        </div>
      </form>
    </section>
  );
}

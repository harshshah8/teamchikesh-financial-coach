"use client";

import { useActionState, useEffect } from "react";
import { endEventFeedback } from "@/app/actions";
import { useCelebration } from "@/components/Celebration";

const initialState = {
  ok: false,
  message: "",
  nonce: 0
};

export function EndTripButton({ eventId }: { eventId: string }) {
  const [state, action, pending] = useActionState(endEventFeedback, initialState);
  const { celebrate, confetti } = useCelebration();

  useEffect(() => {
    if (!state.message || !state.nonce) return;
    if (state.ok) celebrate("done");
  }, [celebrate, state]);

  return (
    <form action={action} className="mt-3">
      {confetti}
      <input type="hidden" name="eventId" value={eventId} />
      <button className="interactive-button h-11 w-full rounded-md bg-clay font-medium text-white" disabled={pending}>
        {pending ? "Ending..." : "Mark Ended"}
      </button>
      {state.message ? <p className={`mt-2 text-xs ${state.ok ? "text-ink/60" : "text-clay"}`}>{state.message}</p> : null}
    </form>
  );
}

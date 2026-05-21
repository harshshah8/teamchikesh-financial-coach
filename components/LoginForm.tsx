"use client";

import { useActionState } from "react";
import { Lock } from "lucide-react";
import { login } from "@/app/actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, { error: "" });

  return (
    <form action={action} className="w-full max-w-sm rounded-lg border border-black/10 bg-white p-5 shadow-soft">
      <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-md bg-mint text-ink">
        <Lock size={22} />
      </div>
      <h1 className="text-2xl font-semibold">Team Chikesh Financial Coach</h1>
      <p className="mt-2 text-sm text-ink/65">Private passcode access for Harsh and Anubhuti.</p>
      <label className="mt-6 block text-sm font-medium" htmlFor="passcode">
        Passcode
      </label>
      <input
        id="passcode"
        name="passcode"
        type="password"
        className="mt-2 h-12 w-full rounded-md border border-black/15 bg-white px-3 outline-none focus:border-ink"
        autoFocus
      />
      {state?.error ? <p className="mt-3 text-sm text-clay">{state.error}</p> : null}
      <button className="interactive-button mt-5 h-12 w-full rounded-md bg-ink font-medium text-white" disabled={pending}>
        {pending ? "Opening..." : "Open app"}
      </button>
      {!process.env.NEXT_PUBLIC_HIDE_DEV_HINT ? <p className="mt-4 text-xs text-ink/45">Local fallback passcode: dev-passcode</p> : null}
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const input =
    "w-full px-3.5 py-2.5 font-medium outline-none";
  return (
    <form action={action} className="space-y-3">
      <input suppressHydrationWarning name="email" type="email" required placeholder="E-poçt ünvanı" autoComplete="username" className={input} />
      <input suppressHydrationWarning name="password" type="password" required placeholder="Parol" autoComplete="current-password" className={input} />
      {state?.error && <p className="text-sm font-semibold text-accent">{state.error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-md bg-[#ff5a1f] px-4 py-3 font-bold text-white transition-colors hover:bg-[#e04810] disabled:opacity-60"
      >
        {pending ? "Daxil olunur…" : "Daxil ol"}
      </button>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { login } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState(login, undefined);
  const input =
    "w-full rounded-2xl border-2 border-transparent bg-surface px-4 py-3 font-semibold outline-none transition focus:border-brand";
  return (
    <form action={action} className="space-y-3">
      <input suppressHydrationWarning name="email" type="email" required placeholder="E-poçt" autoComplete="username" className={input} />
      <input suppressHydrationWarning name="password" type="password" required placeholder="Şifrə" autoComplete="current-password" className={input} />
      {state?.error && <p className="text-sm font-semibold text-accent">{state.error}</p>}
      <button
        disabled={pending}
        className="w-full rounded-full bg-foreground px-4 py-3.5 font-semibold text-white transition hover:bg-brand disabled:opacity-60"
      >
        {pending ? "Daxil olunur…" : "Daxil ol"}
      </button>
    </form>
  );
}

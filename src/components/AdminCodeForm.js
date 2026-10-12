"use client";
import { useActionState, startTransition } from "react";
import Field from "./Field";
import Spinner from "./Spinner";
import { verifyAdminCode } from "@/app/onboarding/actions";

export default function AdminCodeForm() {
  const [state, action, pending] = useActionState(verifyAdminCode, null);

  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5 sm:p-8">
      <Field label="Admin code" hint="The unique code shared with the Buncho team.">
        <input
          name="code"
          type="password"
          required
          maxLength={200}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          className="input"
        />
      </Field>
      {state?.error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{state.error}</p>}
      <button disabled={pending} className="btn-primary">{pending ? (<><Spinner />Checking</>) : "Verify code"}</button>
    </form>
  );
}
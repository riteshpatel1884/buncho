"use client";
import Link from "next/link";
import { useActionState, startTransition } from "react";
import Field from "./Field";
import Spinner from "./Spinner";
import { saveAdminProfile } from "@/app/onboarding/actions";

// Every field is optional.
export default function AdminProfileForm({ profile, name, username }) {
  const [state, action, pending] = useActionState(saveAdminProfile, null);

  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5 sm:p-8">
      <Field label="Name (optional)">
        <input name="name" maxLength={80} defaultValue={name ?? ""} className="input" />
      </Field>
      <Field label="Username (optional)" hint="Unique. 3 to 20 letters, numbers or underscores.">
        <div className="flex items-center rounded-lg border border-line bg-surface focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15">
          <span className="pl-3.5 text-sm text-muted">@</span>
          <input
            name="username"
            maxLength={20}
            pattern="[A-Za-z][A-Za-z0-9_]{2,19}"
            defaultValue={username ?? ""}
            autoCapitalize="none"
            autoComplete="off"
            spellCheck={false}
            className="w-full bg-transparent px-2 py-2.5 text-sm text-ink focus:outline-none"
          />
        </div>
      </Field>
      <Field label="Headline (optional)" hint="One line about your role, for example: Community & Operations Lead">
        <input name="headline" maxLength={90} defaultValue={profile?.headline ?? ""} className="input" />
      </Field>
      <Field label="About you (optional)">
        <textarea name="about" rows={4} maxLength={1000} defaultValue={profile?.about ?? ""} className="input" />
      </Field>
      <Field label="Contact info (optional)" hint="Email, phone or any link where the team can reach you.">
        <input name="contactInfo" maxLength={200} defaultValue={profile?.contactInfo ?? ""} className="input" />
      </Field>
      {state?.error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{state.error}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <button disabled={pending} className="btn-primary">{pending ? (<><Spinner />Saving</>) : "Save and continue"}</button>
        <Link href="/admin" className="btn-outline inline-block">Skip for now</Link>
      </div>
    </form>
  );
}
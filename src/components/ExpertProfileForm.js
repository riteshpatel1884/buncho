"use client";
import { useActionState, startTransition } from "react";
import Field from "./Field";
import Spinner from "./Spinner";
import { saveExpertProfile } from "@/app/onboarding/actions";
import { FIELD_LABELS } from "@/lib/review";

export default function ExpertProfileForm({ profile, name, submitLabel = "Save profile" }) {
  const [state, action, pending] = useActionState(saveExpertProfile, null);

  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4 p-5 sm:p-8">
      <Field label="Your name">
        <input name="name" required maxLength={80} defaultValue={name ?? ""} className="input" />
      </Field>
      <Field label="Headline (optional)" hint="One line students see first, for example: AI Engineer who has reviewed 100+ resumes">
        <input name="headline" maxLength={90} defaultValue={profile?.headline ?? ""} className="input" />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Current role"><input name="jobTitle" required maxLength={80} defaultValue={profile?.jobTitle} placeholder="Software Engineer" className="input" /></Field>
        <Field label="Company"><input name="company" required maxLength={80} defaultValue={profile?.company} className="input" /></Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="College"><input name="college" required maxLength={100} defaultValue={profile?.college} className="input" /></Field>
        <Field label="Branch"><input name="branch" required maxLength={60} defaultValue={profile?.branch} className="input" /></Field>
        <Field label="Graduation year"><input name="graduationYear" type="number" required min={1990} max={2035} defaultValue={profile?.graduationYear} className="input" /></Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Years of experience"><input name="experienceYears" type="number" required min={0} max={40} defaultValue={profile?.experienceYears ?? 0} className="input" /></Field>
        <Field label="Skills" hint="Separate with commas"><input name="skills" defaultValue={profile?.skills?.join(", ")} placeholder="python, ml, system design" className="input" /></Field>
      </div>
      <Field label="About you" hint="At least 40 characters. What have you achieved, and how can you help?">
        <textarea name="bio" required rows={5} maxLength={1500} defaultValue={profile?.bio} className="input" />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="LinkedIn URL" hint="Used by Buncho to check your details">
          <input name="linkedinUrl" type="url" required placeholder="https://linkedin.com/in/..." defaultValue={profile?.linkedinUrl} className="input" />
        </Field>
        <Field label="GitHub URL (optional)">
          <input name="githubUrl" type="url" placeholder="https://github.com/..." defaultValue={profile?.githubUrl ?? ""} className="input" />
        </Field>
      </div>
      {state?.error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{state.error}</p>}
      {state?.ok && !pending && (
        <p role="status" className="rounded-xl bg-brand-soft p-3 text-sm text-brand">
          Saved.
          {state.changed?.length > 0 &&
            ` You changed your ${state.changed.map((f) => FIELD_LABELS[f]).join(", ")}. It shows as "Not verified" until the Buncho team checks it again.`}
        </p>
      )}
      <button disabled={pending} className="btn-primary">{pending ? (<><Spinner />Saving</>) : submitLabel}</button>
    </form>
  );
}
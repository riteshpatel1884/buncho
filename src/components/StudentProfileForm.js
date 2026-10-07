"use client";
import { useActionState, startTransition } from "react";
import Field from "./Field";
import Spinner from "./Spinner";
import { saveStudentProfile } from "@/app/onboarding/actions";
import { STUDY_YEARS } from "@/lib/constants";

export default function StudentProfileForm({ profile, name, submitLabel = "Save profile" }) {
  const [state, action, pending] = useActionState(saveStudentProfile, null);

  // Keeps what was typed if validation fails.
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
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="College"><input name="college" required maxLength={100} defaultValue={profile?.college} className="input" /></Field>
        <Field label="Branch"><input name="branch" required maxLength={60} defaultValue={profile?.branch} placeholder="CSE" className="input" /></Field>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Year">
          <select name="year" required defaultValue={profile?.year ?? ""} className="input">
            <option value="" disabled>Choose one</option>
            {STUDY_YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
        <Field label="Target role"><input name="targetRole" required maxLength={80} defaultValue={profile?.targetRole} placeholder="AI Engineer" className="input" /></Field>
      </div>
      <Field label="Skills" hint="Separate with commas, for example: python, sql, react">
        <input name="skills" defaultValue={profile?.skills?.join(", ")} className="input" />
      </Field>
      <Field label="Your career goal">
        <textarea name="careerGoal" required rows={3} maxLength={400} defaultValue={profile?.careerGoal} placeholder="Get an AI internship this summer" className="input" />
      </Field>
      <Field label="What are you stuck on? (optional)">
        <textarea name="problems" rows={3} maxLength={500} defaultValue={profile?.problems ?? ""} placeholder="My resume isn't getting shortlisted" className="input" />
      </Field>
      {state?.error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{state.error}</p>}
      {state?.ok && !pending && <p role="status" className="rounded-xl bg-brand-soft p-3 text-sm text-brand">Saved.</p>}
      <button disabled={pending} className="btn-primary">{pending ? (<><Spinner />Saving</>) : submitLabel}</button>
    </form>
  );
}

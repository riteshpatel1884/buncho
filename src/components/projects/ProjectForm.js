"use client";
import { useActionState, useState, startTransition } from "react";
import Field from "@/components/Field";
import Spinner from "@/components/Spinner";
import { createProject } from "@/app/projects/actions";
import { SERVICE_TYPES, inr } from "@/lib/constants";
import { BUDGET_MODES, DEADLINES, PRICE_MAX } from "@/lib/projects";

export default function ProjectForm() {
  const [state, action, pending] = useActionState(createProject, null);
  const [mode, setMode] = useState("NEGOTIABLE");
  const [min, setMin] = useState("");
  const [max, setMax] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  }

  const lo = Number(min);
  const hi = Number(max);
  const preview = mode === "OPEN" ? "Open to offers" : lo > 0 && hi >= lo ? (lo === hi ? inr(hi) : `${inr(lo)} to ${inr(hi)}`) : "Set your range";

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-5 sm:p-8">
      <Field label="Project title">
        <input name="title" required minLength={5} maxLength={100} placeholder="Review my AI chatbot's RAG pipeline" className="input" />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Help needed">
          <select name="helpType" required defaultValue="" className="input">
            <option value="" disabled>Choose one</option>
            {Object.entries(SERVICE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Deadline">
          <select name="deadlineDays" required defaultValue="3" className="input">
            {DEADLINES.map((d) => <option key={d} value={d}>{d} {d === 1 ? "day" : "days"}</option>)}
          </select>
        </Field>
      </div>
      <Field label="Describe your project" hint="What you built, where you are stuck, and what a good result looks like. Don't add phone numbers, emails or links.">
        <textarea name="description" required rows={6} minLength={30} maxLength={2000} className="input" />
      </Field>
      <Field label="What do you want to get?" hint="One per line, up to 8. For example: Review of the main code, Improvement suggestions">
        <textarea name="deliverables" required rows={3} className="input" />
      </Field>

      <fieldset>
        <legend className="mb-1.5 text-sm font-medium">Budget</legend>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
          {Object.entries(BUDGET_MODES).map(([key, m]) => (
            <label key={key} className={`cursor-pointer rounded-xl border p-3 text-sm transition-colors ${mode === key ? "border-brand bg-brand-soft" : "border-line hover:border-brand"}`}>
              <input type="radio" name="budgetMode" value={key} checked={mode === key} onChange={() => setMode(key)} className="sr-only" />
              <span className="block font-semibold">{m.label}</span>
              <span className="mt-0.5 block text-xs text-muted">{m.hint}</span>
            </label>
          ))}
        </div>
        {mode !== "OPEN" && (
          <div className="mt-3 grid grid-cols-2 gap-4">
            <Field label="Minimum budget (₹)"><input name="budgetMin" type="number" min={50} max={PRICE_MAX} required value={min} onChange={(e) => setMin(e.target.value)} placeholder="200" className="input" /></Field>
            <Field label="Maximum budget (₹)"><input name="budgetMax" type="number" min={50} max={PRICE_MAX} required value={max} onChange={(e) => setMax(e.target.value)} placeholder="300" className="input" /></Field>
          </div>
        )}
        <div className="mt-3 rounded-xl bg-surface-2 p-4">
          <p className="text-xs text-muted">Your published budget</p>
          <p className="font-display text-2xl">{preview}</p>
          <p className="text-sm text-muted">{BUDGET_MODES[mode].hint}</p>
        </div>
      </fieldset>

      <p className="rounded-xl bg-surface-2 p-4 text-xs text-muted">
        You don't pay now. Buncho reads your project before experts see it. You only pay after you and an expert agree on the price and what you will get.
      </p>
      {state?.error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{state.error}</p>}
      <button disabled={pending} className="btn-primary">{pending ? (<><Spinner />Publishing</>) : "Publish project"}</button>
    </form>
  );
}
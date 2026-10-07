"use client";
import { useActionState, useEffect, useRef, startTransition } from "react";
import Field from "./Field";
import Spinner from "./Spinner";
import { saveService } from "@/app/dashboard/actions";
import { SERVICE_TYPES, DURATIONS } from "@/lib/constants";

// Adds a service (no `service` prop) or edits one.
export default function ServiceForm({ service }) {
  const editing = !!service;
  const [state, action, pending] = useActionState(saveService, null);
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.ok && !editing) formRef.current?.reset();
  }, [state, editing]);

  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="space-y-4">
      {editing && <input type="hidden" name="id" value={service.id} />}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Type">
          <select name="type" required defaultValue={service?.type ?? ""} className="input">
            <option value="" disabled>Choose one</option>
            {Object.entries(SERVICE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </Field>
        <Field label="Title"><input name="title" required maxLength={80} defaultValue={service?.title} placeholder="AI Engineer resume review" className="input" /></Field>
      </div>
      <Field label="Description">
        <textarea name="description" required rows={3} maxLength={500} defaultValue={service?.description} className="input" />
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Price (₹)"><input name="priceInr" type="number" required min={0} max={20000} defaultValue={service?.priceInr ?? 299} className="input" /></Field>
        <Field label="Duration">
          <select name="durationMin" defaultValue={service?.durationMin ?? 30} className="input">
            {DURATIONS.map((d) => <option key={d} value={d}>{d} minutes</option>)}
          </select>
        </Field>
      </div>
      <Field label="What the student gets" hint="One per line, up to 8. For example: ATS check, project feedback">
        <textarea name="deliverables" rows={4} defaultValue={service?.deliverables?.join("\n")} className="input" />
      </Field>
      {editing && (
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="active" defaultChecked={service.active} className="h-4 w-4 accent-[var(--brand)]" />
          Visible to students
        </label>
      )}
      {state?.error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{state.error}</p>}
      {state?.ok && !pending && <p role="status" className="rounded-xl bg-brand-soft p-3 text-sm text-brand">{editing ? "Saved." : "Service added."}</p>}
      <button disabled={pending} className="btn-primary">{pending ? (<><Spinner />Saving</>) : editing ? "Save changes" : "Add service"}</button>
    </form>
  );
}

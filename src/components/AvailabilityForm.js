"use client";
import { useActionState, useEffect, useRef, startTransition } from "react";
import Field from "./Field";
import Spinner from "./Spinner";
import { addAvailability } from "@/app/dashboard/actions";
import { WEEKDAYS } from "@/lib/constants";

export default function AvailabilityForm() {
  const [state, action, pending] = useActionState(addAvailability, null);
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);

  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="card space-y-4 p-5 sm:p-6">
      <h2 className="font-display text-xl font-bold">Add a time window</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Field label="Day">
          <select name="weekday" required defaultValue="" className="input">
            <option value="" disabled>Choose a day</option>
            {WEEKDAYS.map((d, i) => <option key={d} value={i}>{d}</option>)}
          </select>
        </Field>
        <Field label="From"><input name="start" type="time" required className="input" /></Field>
        <Field label="To"><input name="end" type="time" required className="input" /></Field>
      </div>
      {state?.error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{state.error}</p>}
      <button disabled={pending} className="btn-primary">{pending ? (<><Spinner />Adding</>) : "Add window"}</button>
    </form>
  );
}

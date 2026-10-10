"use client";
import { useActionState, startTransition } from "react";
import Spinner from "./Spinner";
import { requestFollowUp } from "@/app/dashboard/actions";

export default function FollowUpForm({ bookingId, left }) {
  const [state, action, pending] = useActionState(requestFollowUp, null);

  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      <input type="hidden" name="id" value={bookingId} />
      <label className="block text-sm font-medium">
        What is still missing?
        <textarea
          name="note"
          required
          rows={4}
          minLength={10}
          maxLength={1000}
          placeholder="For example: you explained the resume format, but I still don't know how to describe my project."
          className="input mt-1.5"
        />
      </label>
      <p className="text-xs text-muted">
        Free. You can ask for {left} more {left === 1 ? "answer" : "answers"} on this request.
      </p>
      {state?.error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{state.error}</p>}
      <button disabled={pending} className="btn-primary">{pending ? (<><Spinner />Sending</>) : "Ask the expert again"}</button>
    </form>
  );
}
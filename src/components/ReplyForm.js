"use client";
import { useActionState, useEffect, useRef, startTransition } from "react";
import Spinner from "./Spinner";
import { sendReply } from "@/app/dashboard/actions";

export default function ReplyForm({ bookingId }) {
  const [state, action, pending] = useActionState(sendReply, null);
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
    <form ref={formRef} onSubmit={onSubmit} className="space-y-3 border-t border-dashed border-line pt-4">
      <input type="hidden" name="id" value={bookingId} />
      <label className="block text-sm font-medium">
        Your reply to the student
        <textarea
          name="body"
          required
          rows={6}
          minLength={20}
          maxLength={4000}
          placeholder="Answer the student's question here."
          className="input mt-1.5"
        />
      </label>
      <p className="text-xs text-muted">
        Don't include phone numbers, emails, links or social handles. Buncho reads every reply before the student gets it, and replies that move the conversation off Buncho are not sent.
      </p>
      {state?.error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{state.error}</p>}
      {state?.ok && !pending && (
        <p role="status" className="rounded-xl bg-brand-soft p-3 text-sm text-brand">
          Sent to Buncho for review. The student gets it once it is approved.
        </p>
      )}
      <button disabled={pending} className="btn-primary">{pending ? (<><Spinner />Sending</>) : "Send"}</button>
    </form>
  );
}
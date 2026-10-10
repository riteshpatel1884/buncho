"use client";
import { useActionState, useState, startTransition } from "react";
import Spinner from "./Spinner";
import { createBooking } from "@/app/book/[serviceId]/actions";
import { inr } from "@/lib/constants";

export default function BookingPicker({ serviceId, priceInr = 0 }) {
  const [state, action, pending] = useActionState(createBooking, null);
  const [note, setNote] = useState("");
  const paid = priceInr > 0;
  const ready = note.trim().length >= 20;

  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("serviceId", serviceId);
    fd.set("note", note);
    startTransition(() => action(fd));
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-6 p-5 sm:p-8">
      <div>
        <label htmlFor="note" className="block font-display text-xl">What do you want help with?</label>
        <p className="mt-1 text-sm text-muted">Be specific. The expert answers exactly what you write here. Please don't add phone numbers or links, everything happens on Buncho.</p>
        <textarea
          id="note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={8}
          minLength={20}
          maxLength={1000}
          required
          placeholder="For example: I'm applying for AI internships and my resume gets no replies. Here is what it contains: ..."
          className="input mt-4"
        />
        <p className="mt-1 text-right text-xs text-muted">{note.length}/1000</p>
      </div>

      {state?.error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{state.error}</p>}

      <div className="space-y-2 border-t border-dashed border-line pt-6">
        <button disabled={pending || !ready} className="btn-primary w-full sm:w-auto">
          {pending ? (
            <><Spinner />{paid ? "Opening payment" : "Sending request"}</>
          ) : paid ? (
            `Pay ${inr(priceInr)} and send`
          ) : (
            "Send request"
          )}
        </button>
        {paid && <p className="text-xs text-muted">You pay securely on the next page. If the expert declines, you get a full refund.</p>}
      </div>
    </form>
  );
}
"use client";
import { useActionState, useState, startTransition } from "react";
import Spinner from "./Spinner";
import { createBooking } from "@/app/book/[serviceId]/actions";
import { inr } from "@/lib/constants";

function StepTitle({ n, children, hint }) {
  return (
    <h2 className="flex items-center gap-3 font-display text-xl">
      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-soft font-sans text-sm font-bold text-brand">{n}</span>
      <span>{children}{hint && <span className="ml-2 font-sans text-sm text-muted">{hint}</span>}</span>
    </h2>
  );
}

export default function BookingPicker({ serviceId, days, priceInr = 0 }) {
  const [state, action, pending] = useActionState(createBooking, null);
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState("");
  const [note, setNote] = useState("");
  const paid = priceInr > 0;

  if (days.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-line p-8">
        <p className="font-display text-2xl">No open times in the next 2 weeks.</p>
        <p className="mt-1 text-sm text-muted">Check back soon, or look at another expert.</p>
      </div>
    );
  }

  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData();
    fd.set("serviceId", serviceId);
    fd.set("startsAt", slot);
    fd.set("note", note);
    startTransition(() => action(fd));
  }

  const day = days[dayIdx];
  return (
    <form onSubmit={onSubmit} className="card space-y-8 p-5 sm:p-8">
      <div>
        <StepTitle n={1}>Pick a day</StepTitle>
        <div className="no-scrollbar -mx-1 mt-4 flex gap-2 overflow-x-auto px-1 pb-1">
          {days.map((d, i) => (
            <button
              type="button"
              key={d.ymd}
              onClick={() => { setDayIdx(i); setSlot(""); }}
              aria-pressed={i === dayIdx}
              className={`shrink-0 rounded-[10px] border px-4 py-2 text-sm font-medium transition-colors ${
                i === dayIdx ? "border-brand bg-brand text-on-brand" : "border-line bg-surface-2 hover:border-brand"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <StepTitle n={2} hint="India time">Pick a time</StepTitle>
        <div className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {day.slots.map((s) => (
            <button
              type="button"
              key={s.iso}
              onClick={() => setSlot(s.iso)}
              aria-pressed={slot === s.iso}
              className={`rounded-[10px] border px-2 py-2 text-sm font-medium transition-colors ${
                slot === s.iso ? "border-brand bg-brand text-on-brand" : "border-line bg-surface-2 hover:border-brand"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <StepTitle n={3} hint="optional">What should they know?</StepTitle>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="For example: I'm applying for AI internships and my resume gets no replies."
          className="input mt-4"
        />
      </div>

      {state?.error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{state.error}</p>}

      <div className="space-y-2 border-t border-dashed border-line pt-6">
        <button disabled={pending || !slot} className="btn-primary w-full sm:w-auto">
          {pending ? (
            <><Spinner />{paid ? "Opening payment" : "Sending request"}</>
          ) : paid ? (
            `Pay ${inr(priceInr)} and send request`
          ) : (
            "Send booking request"
          )}
        </button>
        {paid && <p className="text-xs text-muted">You pay securely on the next page. If the expert declines, you get a full refund.</p>}
      </div>
    </form>
  );
}
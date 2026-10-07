"use client";
import { useActionState, useState, startTransition } from "react";
import Spinner from "./Spinner";
import { createBooking } from "@/app/book/[serviceId]/actions";

export default function BookingPicker({ serviceId, days }) {
  const [state, action, pending] = useActionState(createBooking, null);
  const [dayIdx, setDayIdx] = useState(0);
  const [slot, setSlot] = useState("");
  const [note, setNote] = useState("");

  if (days.length === 0) {
    return (
      <div className="card border-dashed p-8 text-center">
        <p className="font-display text-lg font-semibold">No open times in the next 2 weeks</p>
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
    <form onSubmit={onSubmit} className="card space-y-6 p-5 sm:p-8">
      <div>
        <h2 className="font-display text-xl font-bold">1. Pick a day</h2>
        <div className="no-scrollbar -mx-1 mt-3 flex gap-2 overflow-x-auto px-1 pb-1">
          {days.map((d, i) => (
            <button
              type="button"
              key={d.ymd}
              onClick={() => { setDayIdx(i); setSlot(""); }}
              className={`shrink-0 rounded-xl border px-4 py-2 text-sm font-medium transition-colors ${
                i === dayIdx ? "border-brand bg-brand text-on-brand" : "border-line bg-surface-2 hover:border-brand"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-bold">2. Pick a time <span className="text-sm font-normal text-muted">(India time)</span></h2>
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
          {day.slots.map((s) => (
            <button
              type="button"
              key={s.iso}
              onClick={() => setSlot(s.iso)}
              aria-pressed={slot === s.iso}
              className={`rounded-xl border px-2 py-2 text-sm font-medium transition-colors ${
                slot === s.iso ? "border-brand bg-brand text-on-brand" : "border-line bg-surface-2 hover:border-brand"
              }`}
            >
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h2 className="font-display text-xl font-bold">3. What should they know? <span className="text-sm font-normal text-muted">(optional)</span></h2>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          maxLength={500}
          placeholder="For example: I'm applying for AI internships and my resume gets no replies."
          className="input mt-3"
        />
      </div>

      {state?.error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{state.error}</p>}

      <button disabled={pending || !slot} className="btn-primary w-full sm:w-auto">
        {pending ? (<><Spinner />Sending request</>) : "Send booking request"}
      </button>
    </form>
  );
}

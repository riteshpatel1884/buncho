"use client";
import { useActionState, useCallback, useEffect, useState, startTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Spinner from "./Spinner";
import { submitReport } from "@/app/report/actions";
import { PROBLEM_CATEGORIES, PERSON_CATEGORIES } from "@/lib/reports";

function Dialog({ kind, bookingId, target, onClose }) {
  const [mode, setMode] = useState(kind || ""); // "problem", "person", or "" while the person is choosing
  const [category, setCategory] = useState("");
  const [message, setMessage] = useState("");
  const [username, setUsername] = useState("");
  const [state, action, pending] = useActionState(submitReport, null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const person = mode === "person";
  const cats = person ? PERSON_CATEGORIES : PROBLEM_CATEGORIES;
  const needsUsername = person && !target;
  const ready = category && message.trim().length >= 10 && (!needsUsername || username.trim().length >= 3);

  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  }

  const title = state?.ok
    ? "Thanks, we've got it"
    : !mode
      ? "What do you want to report?"
      : person
        ? target ? `Report ${target.name || "this person"}` : "Report a person"
        : "Report a problem";

  return (
    <div
      className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="report-title"
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl border border-line bg-surface p-5 shadow-2xl sm:max-w-lg sm:rounded-2xl sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <h2 id="report-title" className="font-display text-xl">{title}</h2>
          <button type="button" onClick={onClose} aria-label="Close" className="cursor-pointer rounded-lg p-1 text-muted hover:text-ink">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
          </button>
        </div>

        {state?.ok ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-muted">
              Your report (reference {state.ref}) was sent to the Buncho team. We'll look into it and email you when it has been reviewed.
            </p>
            <button type="button" onClick={onClose} className="btn-primary">Close</button>
          </div>
        ) : !mode ? (
          <div className="mt-4 grid gap-3">
            <button type="button" onClick={() => setMode("problem")} className="cursor-pointer rounded-xl border border-line p-4 text-left hover:border-brand">
              <span className="block font-semibold">A problem</span>
              <span className="mt-0.5 block text-sm text-muted">Payments, refunds, a stuck request, my account, a bug</span>
            </button>
            <button type="button" onClick={() => setMode("person")} className="cursor-pointer rounded-xl border border-line p-4 text-left hover:border-brand">
              <span className="block font-semibold">A person</span>
              <span className="mt-0.5 block text-sm text-muted">An expert or student who broke the rules. You'll need their username.</span>
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="mt-4 space-y-4">
            <input type="hidden" name="kind" value={person ? "PERSON" : "PROBLEM"} />
            <input type="hidden" name="category" value={category} />
            {bookingId && <input type="hidden" name="bookingId" value={bookingId} />}
            {target && <input type="hidden" name="targetUserId" value={target.id} />}

            {person && target && (
              <p className="rounded-xl bg-surface-2 p-3 text-sm">
                Reporting <b>{target.name || "this person"}</b>{target.username ? ` (@${target.username})` : ""}
              </p>
            )}
            {needsUsername && (
              <label className="block text-sm font-medium">
                Their username
                <div className="mt-1.5 flex items-center rounded-lg border border-line bg-surface focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15">
                  <span className="pl-3.5 text-sm text-muted">@</span>
                  <input
                    name="targetUsername"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    maxLength={21}
                    autoCapitalize="none"
                    autoComplete="off"
                    spellCheck={false}
                    required
                    className="w-full bg-transparent px-2 py-2.5 text-sm text-ink focus:outline-none"
                  />
                </div>
              </label>
            )}

            <fieldset>
              <legend className="text-sm font-medium">{person ? "What happened?" : "What is it about?"}</legend>
              <div className="mt-2 flex flex-wrap gap-2">
                {Object.entries(cats).map(([key, label]) => (
                  <label
                    key={key}
                    className={`cursor-pointer rounded-lg border px-3 py-2 text-sm transition-colors ${
                      category === key ? "border-brand bg-brand-soft text-brand" : "border-line hover:border-brand"
                    }`}
                  >
                    <input type="radio" name="pick" value={key} checked={category === key} onChange={() => setCategory(key)} className="sr-only" />
                    {label}
                  </label>
                ))}
              </div>
            </fieldset>

            <label className="block text-sm font-medium">
              {person ? "Tell us what happened" : "Describe the problem"}
              <textarea
                name="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                rows={5}
                minLength={10}
                maxLength={1500}
                placeholder={person ? "Write the reason for your report." : "What went wrong? Include amounts or dates if it is about a payment."}
                className="input mt-1.5"
              />
            </label>

            {state?.error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{state.error}</p>}

            <div className="flex flex-wrap items-center gap-2">
              <button disabled={pending || !ready} className="btn-primary">
                {pending ? (<><Spinner />Sending</>) : "Send report"}
              </button>
              {!kind && (
                <button type="button" onClick={() => { setMode(""); setCategory(""); }} className="btn-outline">Back</button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// kind: "problem" or "person" skips the first screen. target: { id, name, username } is the person being reported.
export default function ReportButton({ signedIn = true, kind, bookingId, target, label = "Report a problem", className = "" }) {
  const [open, setOpen] = useState(false);
  const [nonce, setNonce] = useState(0);
  const close = useCallback(() => setOpen(false), []);

  if (!signedIn) return <Link href="/sign-in" className={className}>{label}</Link>;

  return (
    <>
      <button type="button" onClick={() => { setNonce((n) => n + 1); setOpen(true); }} className={`cursor-pointer ${className}`}>
        {label}
      </button>
      {open && createPortal(<Dialog key={nonce} kind={kind} bookingId={bookingId} target={target} onClose={close} />, document.body)}
    </>
  );
}
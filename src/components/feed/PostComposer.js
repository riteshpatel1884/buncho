"use client";
import { useActionState, useEffect, useRef, useState, startTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Spinner from "../Spinner";
import { createPost } from "@/app/feed/actions";
import { TOPICS, MAX_POST } from "@/lib/feed/feed";
import { inr } from "@/lib/constants";

const BITS = Array.from({ length: 22 }, (_, i) => {
  const a = (i / 22) * Math.PI * 2;
  const d = 90 + (i % 5) * 28;
  return {
    x: Math.round(Math.cos(a) * d), y: Math.round(Math.sin(a) * d - 40),
    r: (i % 2 ? 1 : -1) * (180 + i * 20),
    c: ["var(--brand)", "#f43f5e", "#f59e0b", "#10b981", "#8b5cf6"][i % 5],
  };
});

function Success() {
  return (
    <div className="relative flex flex-col items-center py-12 text-center">
      {BITS.map((b, i) => (
        <span key={i} className="confetti-bit" style={{ "--x": `${b.x}px`, "--y": `${b.y}px`, "--r": `${b.r}deg`, background: b.c, animationDelay: `${(i % 4) * 40}ms` }} />
      ))}
      <span className="success-badge flex h-16 w-16 items-center justify-center rounded-full bg-brand text-on-brand">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path className="check-path" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <p className="mt-4 font-display text-xl">Your post is live!</p>
      <p className="mt-1 text-sm text-muted">Everyone can read it in the feed now.</p>
    </div>
  );
}

// A "Create post" button. The form opens in a pop-up. Only shown to experts and admins by the page;
// the server action enforces the same rule.
// optionalTopic: the admin may post without choosing a category.
export default function PostComposer({ services = [], optionalTopic = false }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [state, action, pending] = useActionState(createPost, null);
  const [text, setText] = useState("");
  const formRef = useRef(null);

  function close() {
    if (pending) return;
    setOpen(false);
    setDone(false);
  }

  useEffect(() => {
    if (!state?.ok) return;
    setDone(true);
    setText("");
    formRef.current?.reset();
    router.refresh();
    const t = setTimeout(() => { setOpen(false); setDone(false); }, 1900);
    return () => clearTimeout(t);
  }, [state, router]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && !pending && (setOpen(false), setDone(false));
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, pending]);

  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  }

  return (
    <>
      <div className="card flex items-center justify-between gap-3 p-4">
        <p className="min-w-0 text-sm text-muted">Share a lesson, tip or update with students.</p>
        <button type="button" onClick={() => { setDone(false); setOpen(true); }} className="btn-primary shrink-0 cursor-pointer">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          Create post
        </button>
      </div>

      {open && createPortal(
        <div className="modal-backdrop fixed inset-0 z-[70] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <div role="dialog" aria-modal="true" aria-label="Create post" className="modal-panel relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-2xl sm:max-w-xl sm:rounded-2xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <p className="font-display text-lg">Create post</p>
              <button type="button" onClick={close} aria-label="Close" className="cursor-pointer rounded-lg p-1 text-muted hover:text-ink">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            {done ? <Success /> : (
              <form ref={formRef} onSubmit={onSubmit} className="space-y-3 overflow-y-auto p-5">
                <textarea
                  id="post-body" name="body" rows={5} required minLength={20} maxLength={MAX_POST} autoFocus
                  value={text} onChange={(e) => setText(e.target.value)} aria-label="Post"
                  placeholder="A lesson from your placement, a resume mistake you keep seeing, a roadmap for juniors…"
                  className="input"
                />
                <div className={`grid grid-cols-1 gap-3 ${services.length > 0 ? "sm:grid-cols-2" : ""}`}>
                  <select name="topic" required={!optionalTopic} defaultValue="" className="input" aria-label="Topic">
                    {optionalTopic ? <option value="">No category</option> : <option value="" disabled>Choose a topic</option>}
                    {Object.entries(TOPICS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                  {services.length > 0 && (
                    <select name="serviceId" defaultValue="" className="input" aria-label="Link a service (optional)">
                      <option value="">No service link</option>
                      {services.map((s) => <option key={s.id} value={s.id}>{s.title} · {inr(s.priceInr)}</option>)}
                    </select>
                  )}
                </div>
                <p className="text-xs text-muted">Posts are free for everyone to read. Don't include phone numbers, emails, links or handles. {text.length}/{MAX_POST}</p>
                {state?.error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{state.error}</p>}
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={close} disabled={pending} className="btn-outline">Cancel</button>
                  <button disabled={pending || text.trim().length < 20} className="btn-primary">{pending ? (<><Spinner />Posting</>) : "Post"}</button>
                </div>
              </form>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
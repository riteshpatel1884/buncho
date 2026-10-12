"use client";
import { useActionState, useEffect, useRef, useState, startTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Avatar from "../Avatar";
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
    <div className="relative flex flex-col items-center py-14 text-center">
      {BITS.map((b, i) => (
        <span key={i} className="confetti-bit" style={{ "--x": `${b.x}px`, "--y": `${b.y}px`, "--r": `${b.r}deg`, background: b.c, animationDelay: `${(i % 4) * 40}ms` }} />
      ))}
      <span className="success-badge flex h-16 w-16 items-center justify-center rounded-full bg-brand text-on-brand">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path className="check-path" d="M5 13l4 4L19 7" />
        </svg>
      </span>
      <p className="mt-4 font-display text-xl">Your post is live</p>
      <p className="mt-1 text-sm text-muted">Everyone can read it in the feed now.</p>
    </div>
  );
}

// An inline "start a post" card. The form opens in a pop-up.
// user: { name, avatarUrl } of the signed-in person, shown next to the prompt.
// optionalTopic: the admin may post without choosing a topic.
export default function PostComposer({ services = [], optionalTopic = false, user = null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);
  const [state, action, pending] = useActionState(createPost, null);
  const [text, setText] = useState("");
  const [topic, setTopic] = useState("");
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
    setTopic("");
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
    fd.set("topic", topic);
    startTransition(() => action(fd));
  }

  const openForm = () => { setDone(false); setOpen(true); };
  const pct = Math.min(100, Math.round((text.length / MAX_POST) * 100));
  const ready = text.trim().length >= 20 && (optionalTopic || !!topic);

  return (
    <>
      <div className="card flex items-center gap-3 p-3 sm:p-4">
        {user && <Avatar name={user.name} src={user.avatarUrl} size={44} />}
        <button
          type="button"
          onClick={openForm}
          className="min-w-0 flex-1 cursor-pointer truncate rounded-full border border-line bg-surface-2 px-4 py-2.5 text-left text-sm text-muted transition-colors hover:border-brand hover:text-ink"
        >
          Share a lesson, a build or a question
        </button>
        <button type="button" onClick={openForm} className="btn-primary hidden shrink-0 cursor-pointer !rounded-full sm:inline-flex">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true"><path d="M12 5v14M5 12h14" /></svg>
          Create post
        </button>
      </div>

      {open && createPortal(
        <div className="modal-backdrop fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && close()}>
          <div role="dialog" aria-modal="true" aria-label="Create post" className="modal-panel relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-2xl sm:max-w-xl sm:rounded-3xl">
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <p className="font-display text-lg">Create post</p>
              <button type="button" onClick={close} aria-label="Close" className="cursor-pointer rounded-full p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-ink">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            {done ? <Success /> : (
              <form ref={formRef} onSubmit={onSubmit} className="flex min-h-0 flex-col overflow-y-auto">
                <div className="flex gap-3 px-5 pt-4">
                  {user && <Avatar name={user.name} src={user.avatarUrl} size={44} />}
                  <div className="min-w-0 flex-1">
                    {user?.name && <p className="mb-1 truncate font-semibold">{user.name}</p>}
                    <textarea
                      id="post-body" name="body" rows={6} required minLength={20} maxLength={MAX_POST} autoFocus
                      value={text} onChange={(e) => setText(e.target.value)} aria-label="Post"
                      placeholder="A lesson from your placement, a build you shipped, or a question you're stuck on"
                      className="w-full resize-none bg-transparent text-base leading-7 text-ink placeholder:text-muted/70 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="mx-5 h-0.5 overflow-hidden rounded-full bg-surface-2" aria-hidden="true">
                  <div className={`h-full rounded-full transition-[width] duration-200 ${pct > 90 ? "bg-danger" : "bg-brand"}`} style={{ width: `${pct}%` }} />
                </div>

                <div className="space-y-4 px-5 pb-5 pt-4">
                  <fieldset>
                    <legend className="text-xs font-semibold text-muted">Topic{optionalTopic ? " (optional)" : ""}</legend>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(TOPICS).map(([k, v]) => (
                        <button
                          key={k}
                          type="button"
                          aria-pressed={topic === k}
                          onClick={() => setTopic(topic === k && optionalTopic ? "" : k)}
                          className={`cursor-pointer rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${topic === k ? "border-brand bg-brand-soft text-brand" : "border-line text-muted hover:border-brand hover:text-ink"}`}
                        >
                          #{v}
                        </button>
                      ))}
                    </div>
                  </fieldset>

                  {services.length > 0 && (
                    <select name="serviceId" defaultValue="" className="input" aria-label="Link a service (optional)">
                      <option value="">No service link</option>
                      {services.map((s) => <option key={s.id} value={s.id}>{s.title} · {inr(s.priceInr)}</option>)}
                    </select>
                  )}

                  <p className="text-xs text-muted">Posts are free for everyone to read. Don't include phone numbers, emails, links or handles.</p>
                  {state?.error && <p role="alert" className="rounded-xl bg-danger-soft p-3 text-sm text-danger">{state.error}</p>}

                  <div className="flex items-center justify-between gap-3">
                    <span className={`text-xs tabular-nums ${pct > 90 ? "text-danger" : "text-muted"}`}>{text.length}/{MAX_POST}</span>
                    <div className="flex gap-2">
                      <button type="button" onClick={close} disabled={pending} className="btn-outline !rounded-full">Cancel</button>
                      <button disabled={pending || !ready} className="btn-primary !rounded-full">{pending ? (<><Spinner />Posting</>) : "Post"}</button>
                    </div>
                  </div>
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
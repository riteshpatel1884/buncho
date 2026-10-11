"use client";
import { useActionState, useEffect, useRef, useState, startTransition } from "react";
import { useRouter } from "next/navigation";
import Spinner from "../Spinner";
import { createPost } from "@/app/feed/actions";
import { TOPICS, MAX_POST } from "@/lib/feed/feed";
import { inr } from "@/lib/constants";

// optionalTopic: the admin may post without choosing a category.
export default function PostComposer({ services = [], optionalTopic = false }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(createPost, null);
  const [text, setText] = useState("");
  const formRef = useRef(null);

  useEffect(() => {
    if (state?.ok) { formRef.current?.reset(); setText(""); router.refresh(); }
  }, [state, router]);

  function onSubmit(e) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => action(fd));
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} className="card space-y-3 p-4 sm:p-5">
      <label htmlFor="post-body" className="font-display text-lg">Share something useful</label>
      <textarea
        id="post-body" name="body" rows={4} required minLength={20} maxLength={MAX_POST}
        value={text} onChange={(e) => setText(e.target.value)}
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
      {state?.ok && !pending && <p role="status" className="rounded-xl bg-brand-soft p-3 text-sm text-brand">Posted.</p>}
      <button disabled={pending || text.trim().length < 20} className="btn-primary">{pending ? (<><Spinner />Posting</>) : "Post"}</button>
    </form>
  );
}
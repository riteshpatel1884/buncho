"use client";
import { useActionState } from "react";
import { castVote } from "@/app/actions/polls";
import { btnPrimary } from "./ui";

export default function VoteForm({ pollId, options }) {
  const [state, action, pending] = useActionState(castVote, null);
  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="pollId" value={pollId} />
      {options.map((o) => (
        <label key={o.id} className="flex cursor-pointer items-center gap-3 rounded-lg border border-border px-3 py-2.5 text-sm hover:border-brand/60 has-[:checked]:border-brand has-[:checked]:bg-brand/10">
          <input type="radio" name="optionId" value={o.id} required className="accent-[var(--brand)]" />
          {o.text}
        </label>
      ))}
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      <button className={btnPrimary} disabled={pending}>{pending ? "Submitting…" : "Submit vote"}</button>
    </form>
  );
}
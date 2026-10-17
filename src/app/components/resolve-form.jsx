"use client";
import { useActionState } from "react";
import { resolvePoll } from "@/app/actions/polls";
import { btnPrimary, card, inputCls } from "./ui";

export default function ResolveForm({ pollId, options, criteria, source }) {
  const [state, action, pending] = useActionState(resolvePoll, null);
  return (
    <form action={action} className={`${card} space-y-3 p-5`}>
      <h3 className="font-semibold">Resolve this prediction</h3>
      <p className="text-xs text-muted">
        Criteria: {criteria}
        {source && <> · Source: <a className="underline" href={source} target="_blank" rel="noreferrer">{source}</a></>}
      </p>
      <input type="hidden" name="pollId" value={pollId} />
      <select name="winningOptionId" required className={inputCls} defaultValue="">
        <option value="" disabled>What actually happened?</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.text}</option>)}
      </select>
      <textarea name="evidenceNote" required minLength={10} maxLength={500} rows={3} className={inputCls} placeholder="Explain how the outcome was verified" />
      <input name="evidenceUrl" type="url" className={inputCls} placeholder="Evidence link (optional)" />
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      <button className={btnPrimary} disabled={pending}>{pending ? "Saving…" : "Record outcome"}</button>
    </form>
  );
}
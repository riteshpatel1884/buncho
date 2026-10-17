"use client";
import { useActionState, useState } from "react";
import { Plus, X } from "lucide-react";
import { createPoll } from "@/app/actions/polls";
import { DURATIONS, POLL_TYPES } from "@/lib/poll-utils";
import { btnGhost, btnPrimary, card, inputCls } from "./ui";

export default function CreatePollForm({ tags }) {
  const [state, action, pending] = useActionState(createPoll, null);
  const [type, setType] = useState("OPINION");
  const [options, setOptions] = useState(["", ""]);

  const setOpt = (i, v) => setOptions((o) => o.map((x, idx) => (idx === i ? v : x)));

  return (
    <form action={action} className={`${card} space-y-5 p-6`}>
      <div>
        <label className="mb-1 block text-sm font-medium">Type</label>
        <div className="flex flex-wrap gap-2">
          {Object.entries(POLL_TYPES).map(([key, t]) => (
            <label key={key} className="cursor-pointer rounded-lg border border-border px-3 py-1.5 text-sm has-[:checked]:border-brand has-[:checked]:bg-brand/10">
              <input type="radio" name="type" value={key} checked={type === key} onChange={() => setType(key)} className="sr-only" />
              {t.label}
            </label>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Question</label>
        <input name="question" required minLength={10} maxLength={200} className={inputCls}
          placeholder={type === "PREDICTION" ? "Will X happen before Friday?" : "What do you think?"} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Description (optional)</label>
        <textarea name="description" maxLength={1000} rows={3} className={inputCls} />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium">Options (2–6)</label>
        <div className="space-y-2">
          {options.map((o, i) => (
            <div key={i} className="flex gap-2">
              <input name="options" value={o} onChange={(e) => setOpt(i, e.target.value)} maxLength={80} className={inputCls} placeholder={`Option ${i + 1}`} />
              {options.length > 2 && (
                <button type="button" aria-label="Remove option" className={btnGhost} onClick={() => setOptions((x) => x.filter((_, idx) => idx !== i))}>
                  <X className="size-4" />
                </button>
              )}
            </div>
          ))}
        </div>
        {options.length < 6 && (
          <button type="button" className={`${btnGhost} mt-2`} onClick={() => setOptions((x) => [...x, ""])}>
            <Plus className="size-4" /> Add option
          </button>
        )}
      </div>

      {type === "PREDICTION" && (
        <div className="space-y-3 rounded-lg border border-brand/40 bg-brand/5 p-4">
          <p className="text-xs text-muted">Predictions need a clear, checkable outcome. The majority vote is never treated as proof.</p>
          <div>
            <label className="mb-1 block text-sm font-medium">Resolution criteria</label>
            <textarea name="resolutionCriteria" rows={2} maxLength={500} className={inputCls} placeholder="Resolves Yes if the official announcement confirms the launch before 23:59 IST on Friday." />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium">Resolution source (optional URL)</label>
            <input name="resolutionSource" type="url" className={inputCls} placeholder="https://…" />
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm font-medium">Closes in</label>
          <select name="duration" defaultValue="24h" className={inputCls}>
            {Object.entries(DURATIONS).map(([k, d]) => <option key={k} value={k}>{d.label}</option>)}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Tags (up to 3)</label>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <label key={t.id} className="cursor-pointer rounded-full border border-border px-2.5 py-1 text-xs has-[:checked]:border-brand has-[:checked]:bg-brand/10">
                <input type="checkbox" name="tags" value={t.slug} className="sr-only" />
                {t.name}
              </label>
            ))}
          </div>
        </div>
      </div>

      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      <button className={btnPrimary} disabled={pending}>{pending ? "Publishing…" : "Publish poll"}</button>
    </form>
  );
}
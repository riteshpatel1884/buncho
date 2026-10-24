'use client';

import { useState } from 'react';

export const inputCls = 'w-full rounded-md border border-line bg-surface px-3 py-2 text-sm outline-none focus:border-accent';

export function Section({ title, children, open = true }) {
  return (
    <details open={open} className="group rounded-lg border border-line bg-surface">
      <summary className="cursor-pointer list-none px-4 py-3 text-sm font-semibold marker:hidden">
        <span className="flex items-center justify-between">
          {title}
          <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-180">⌄</span>
        </span>
      </summary>
      <div className="space-y-4 border-t border-line px-4 py-4">{children}</div>
    </details>
  );
}

export function Field({ id, label, hint, count, max, min, error, children }) {
  const bad = count != null && ((max && count > max) || (min && count < min && count > 0));
  return (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <label htmlFor={id} className="text-sm font-medium">{label}</label>
        {count != null && <span className={`text-xs tabular-nums ${bad ? 'text-hard' : 'text-muted'}`}>{count}{max ? `/${max}` : ''}</span>}
      </div>
      <div className="mt-1">{children}</div>
      {hint && !error && <p className="mt-1 text-xs text-muted">{hint}</p>}
      {error && <p className="mt-1 text-xs text-hard">{error}</p>}
    </div>
  );
}

export function TagInput({ id, value, onChange, max = 8 }) {
  const [draft, setDraft] = useState('');

  function add(raw) {
    const tag = raw.toLowerCase().replace(/[^a-z0-9+#. -]/g, '').replace(/\s+/g, ' ').trim().slice(0, 32);
    if (tag && !value.includes(tag) && value.length < max) onChange([...value, tag]);
    setDraft('');
  }

  return (
    <div>
      <div className="flex flex-wrap gap-1.5">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 rounded-full bg-surface-2 py-1 pl-2.5 pr-1.5 text-xs font-medium">
            #{t}
            <button type="button" aria-label={`Remove tag ${t}`} onClick={() => onChange(value.filter((x) => x !== t))} className="grid h-4 w-4 place-items-center rounded-full hover:bg-line">×</button>
          </span>
        ))}
      </div>
      <input
        id={id}
        value={draft}
        onChange={(e) => (e.target.value.includes(',') ? add(e.target.value.replace(',', '')) : setDraft(e.target.value))}
        onKeyDown={(e) => {
          if (e.key === 'Enter') { e.preventDefault(); add(draft); }
          if (e.key === 'Backspace' && !draft && value.length) onChange(value.slice(0, -1));
        }}
        onBlur={() => draft && add(draft)}
        placeholder={value.length >= max ? `Maximum ${max} tags` : 'Type a tag, press Enter'}
        disabled={value.length >= max}
        className={`${inputCls} mt-2`}
      />
    </div>
  );
}

export function ResourcesField({ value, onChange, types }) {
  const update = (i, patch) => onChange(value.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  return (
    <div className="space-y-3">
      {value.map((r, i) => (
        <div key={i} className="space-y-2 rounded-md border border-line p-2.5">
          <div className="flex gap-2">
            <select aria-label="Resource type" value={r.type} onChange={(e) => update(i, { type: e.target.value })} className="h-9 rounded-md border border-line bg-surface px-2 text-sm">
              {Object.entries(types).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
            <input aria-label="Resource label" value={r.label} onChange={(e) => update(i, { label: e.target.value })} placeholder="Label" className={inputCls} />
          </div>
          <div className="flex gap-2">
            <input aria-label="Resource URL" value={r.url} onChange={(e) => update(i, { url: e.target.value })} placeholder="https://" className={inputCls} />
            <button type="button" onClick={() => onChange(value.filter((_, idx) => idx !== i))} className="rounded-md px-2 text-sm text-hard hover:bg-surface-2" aria-label="Remove resource">×</button>
          </div>
        </div>
      ))}
      {value.length < 8 && (
        <button type="button" onClick={() => onChange([...value, { type: 'github', label: '', url: '' }])} className="rounded-md border border-line px-3 py-1.5 text-xs font-medium hover:bg-surface-2">
          Add resource
        </button>
      )}
    </div>
  );
}

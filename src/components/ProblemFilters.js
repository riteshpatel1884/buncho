'use client';

import { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DIFFICULTIES, DIFFICULTY_LABEL, PROBLEM_TYPES, TYPE_LABEL } from '@/lib/constants';

const selectCls = 'rounded-md border border-line bg-surface-2 px-3 py-2 text-sm';

export default function ProblemFilters({ topics = [], hideTopic = false }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(sp.get('q') ?? '');

  const update = useCallback(
    (patch) => {
      const params = new URLSearchParams(sp.toString());
      Object.entries(patch).forEach(([k, v]) => (v ? params.set(k, v) : params.delete(k)));
      params.delete('page');
      const qs = params.toString();
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
    },
    [sp, pathname, router],
  );

  // Debounced search
  useEffect(() => {
    const t = setTimeout(() => {
      if ((sp.get('q') ?? '') !== q.trim()) update({ q: q.trim() });
    }, 350);
    return () => clearTimeout(t);
  }, [q, sp, update]);

  const difficulty = sp.get('difficulty') ?? '';
  const hasFilters = Boolean(sp.get('q') || difficulty || sp.get('type') || sp.get('topic'));

  return (
    <div className="space-y-4" aria-busy={pending}>
      <div className="flex flex-col gap-3 lg:flex-row">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">Search problems</label>
          <input
            id="search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by title, concept or keyword"
            className="w-full rounded-md border border-line bg-surface-2 px-4 py-2 text-sm"
          />
        </div>
        {!hideTopic && (
          <div>
            <label htmlFor="topic" className="sr-only">Topic</label>
            <select id="topic" value={sp.get('topic') ?? ''} onChange={(e) => update({ topic: e.target.value })} className={`${selectCls} w-full`}>
              <option value="">All topics</option>
              {topics.map((t) => (
                <option key={t.slug} value={t.slug}>{t.name}</option>
              ))}
            </select>
          </div>
        )}
        <div>
          <label htmlFor="type" className="sr-only">Problem type</label>
          <select id="type" value={sp.get('type') ?? ''} onChange={(e) => update({ type: e.target.value })} className={`${selectCls} w-full`}>
            <option value="">All types</option>
            {PROBLEM_TYPES.map((t) => (
              <option key={t} value={t}>{TYPE_LABEL[t]}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Difficulty">
        {['', ...DIFFICULTIES].map((d) => (
          <button
            key={d || 'all'}
            type="button"
            aria-pressed={difficulty === d}
            onClick={() => update({ difficulty: d })}
            className={`rounded-full border px-4 py-1.5 text-sm font-semibold transition-colors ${
              difficulty === d ? 'border-transparent bg-ink text-bg' : 'border-transparent bg-surface-2 text-muted hover:text-ink'
            }`}
          >
            {d ? DIFFICULTY_LABEL[d] : 'All levels'}
          </button>
        ))}
        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQ('');
              startTransition(() => router.replace(pathname, { scroll: false }));
            }}
            className="ml-1 text-sm font-medium text-accent underline underline-offset-4"
          >
            Clear filters
          </button>
        )}
      </div>
    </div>
  );
}
'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { DIFFICULTIES, DIFFICULTY_LABEL, PROBLEM_TYPES, TYPE_LABEL } from '@/lib/constants';
import { Search } from './icons';

const selectCls = 'h-9 rounded-lg bg-surface-2 px-3 text-sm text-ink outline-none';
const pillCls = (on) =>
  `shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
    on ? 'bg-ink text-bg' : 'bg-surface-2 text-muted hover:text-ink'
  }`;

function MiniRing({ solved, total }) {
  const r = 8;
  const c = 2 * Math.PI * r;
  const pct = total ? Math.min(1, solved / total) : 0;
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" className="-rotate-90" aria-hidden="true">
      <circle cx="11" cy="11" r={r} fill="none" stroke="var(--surface-2)" strokeWidth="3" />
      <circle cx="11" cy="11" r={r} fill="none" stroke="var(--easy)" strokeWidth="3" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct)} />
    </svg>
  );
}

/**
 * Topic pills + search + difficulty/type selects.
 * On /problems the pills filter in place. On a topic page (currentTopic is set) they are links to the other topics.
 * solved: number | null. When null, only the problem count is shown.
 */
export default function ProblemFilters({ topics = [], currentTopic, solved = null, total = 0 }) {
  const router = useRouter();
  const pathname = usePathname();
  const sp = useSearchParams();
  const [pending, startTransition] = useTransition();
  const [q, setQ] = useState(sp.get('q') ?? '');
  const onTopicPage = currentTopic !== undefined;

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
  const activeTopic = onTopicPage ? currentTopic : sp.get('topic') ?? '';
  const hasFilters = Boolean(sp.get('q') || difficulty || sp.get('type') || (!onTopicPage && sp.get('topic')));

  return (
    <div className="space-y-3" aria-busy={pending}>
      {/* Topic pills */}
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1" role="group" aria-label="Topic">
        {onTopicPage ? (
          <>
            <Link href="/problems" className={pillCls(false)}>All Topics</Link>
            {topics.map((t) => (
              <Link key={t.slug} href={`/topics/${t.slug}`} aria-current={t.slug === activeTopic ? 'page' : undefined} className={pillCls(t.slug === activeTopic)}>
                {t.name}
              </Link>
            ))}
          </>
        ) : (
          <>
            <button type="button" aria-pressed={!activeTopic} onClick={() => update({ topic: '' })} className={pillCls(!activeTopic)}>
              All Topics
            </button>
            {topics.map((t) => (
              <button key={t.slug} type="button" aria-pressed={activeTopic === t.slug} onClick={() => update({ topic: t.slug })} className={pillCls(activeTopic === t.slug)}>
                {t.name}
              </button>
            ))}
          </>
        )}
      </div>

      {/* Search, selects, solved counter */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative min-w-48 flex-1 sm:max-w-xs">
          <label htmlFor="search" className="sr-only">Search problems</label>
          <Search width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="search"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search questions"
            className="h-9 w-full rounded-lg bg-surface-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted"
          />
        </div>

        <label htmlFor="difficulty" className="sr-only">Difficulty</label>
        <select id="difficulty" value={difficulty} onChange={(e) => update({ difficulty: e.target.value })} className={selectCls}>
          <option value="">Difficulty</option>
          {DIFFICULTIES.map((d) => (
            <option key={d} value={d}>{DIFFICULTY_LABEL[d]}</option>
          ))}
        </select>

        <label htmlFor="type" className="sr-only">Problem type</label>
        <select id="type" value={sp.get('type') ?? ''} onChange={(e) => update({ type: e.target.value })} className={selectCls}>
          <option value="">All types</option>
          {PROBLEM_TYPES.map((t) => (
            <option key={t} value={t}>{TYPE_LABEL[t]}</option>
          ))}
        </select>

        {hasFilters && (
          <button
            type="button"
            onClick={() => {
              setQ('');
              startTransition(() => router.replace(pathname, { scroll: false }));
            }}
            className="px-2 text-sm font-medium text-accent hover:underline"
          >
            Clear
          </button>
        )}

        <p className="ml-auto flex items-center gap-2 text-sm text-muted">
          {solved !== null ? (
            <>
              <MiniRing solved={solved} total={total} />
              {solved}/{total} Solved
            </>
          ) : (
            <>{total} {total === 1 ? 'problem' : 'problems'}</>
          )}
        </p>
      </div>
    </div>
  );
}
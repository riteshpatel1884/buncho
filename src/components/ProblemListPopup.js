'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import DifficultyBadge from './DifficultyBadge';
import { List } from './icons';

export default function ProblemListPopup({ items, remaining, signedIn }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors hover:bg-surface"
      >
        <List width={18} height={18} /> Problem List
      </button>

      {open && (
        <div
          role="dialog"
          aria-label="Up next"
          className="absolute left-0 top-full z-30 mt-2 flex max-h-[70dvh] w-[min(26rem,calc(100vw-1rem))] flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-xl"
        >
          <div className="shrink-0 border-b border-line px-4 py-3">
            <p className="text-sm font-semibold">{signedIn ? 'Up next' : 'Next problems'}</p>
            <p className="text-xs text-muted">
              {signedIn
                ? `${Math.min(items.length, 20)} of ${remaining} unsolved`
                : 'Log in to see only the problems you have not solved.'}
            </p>
          </div>

          {items.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted">You have solved every problem. Nice work.</p>
          ) : (
            <ul className="min-h-0 flex-1 divide-y divide-line overflow-y-auto">
              {items.map((p) => (
                <li key={p.slug}>
                  <Link
                    href={`/problems/${p.slug}`}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm hover:bg-surface-2"
                  >
                    <span className="min-w-0">
                      <span className="block truncate">{p.title}</span>
                      {p.attempted && <span className="text-xs text-medium">Attempted</span>}
                    </span>
                    <DifficultyBadge difficulty={p.difficulty} plain />
                  </Link>
                </li>
              ))}
            </ul>
          )}

          <Link
            href="/problems"
            onClick={() => setOpen(false)}
            className="shrink-0 border-t border-line px-4 py-2.5 text-center text-sm font-semibold text-accent hover:bg-surface-2"
          >
            View all problems
          </Link>
        </div>
      )}
    </div>
  );
}
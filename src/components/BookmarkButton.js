'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { toggleBookmark } from '@/app/actions';
import { Bookmark } from './icons';
import Spinner from './Spinner';

const cls =
  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted hover:bg-surface-2 hover:text-ink';

const pillCls =
  'inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted hover:text-ink';

// pill: renders in the same small pill style as the tags (difficulty, topic, minutes) on the problem page
export default function BookmarkButton({ problemId, slug, initial = false, signedIn, pill = false }) {
  const base = pill ? pillCls : cls;
  const size = pill ? 14 : 16;
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();

  if (!signedIn) {
    return (
      <Link href={`/login?redirect_url=${encodeURIComponent(`/problems/${slug}`)}`} className={base}>
        <Bookmark width={size} height={size} /> Save for later
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-busy={pending}
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await toggleBookmark(problemId);
          if (res.ok) setOn(res.bookmarked);
        })
      }
      className={`${base} disabled:cursor-wait ${on ? 'text-accent' : ''}`}
    >
      {pending ? <Spinner size={size} /> : <Bookmark width={size} height={size} filled={on} />}
      {pending ? 'Saving…' : on ? 'Saved' : 'Save for later'}
    </button>
  );
}
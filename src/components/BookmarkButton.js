'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { toggleBookmark } from '@/app/actions';
import { Bookmark } from './icons';
import Spinner from './Spinner';

const cls =
  'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium text-muted hover:bg-surface-2 hover:text-ink';

export default function BookmarkButton({ problemId, slug, initial = false, signedIn }) {
  const [on, setOn] = useState(initial);
  const [pending, start] = useTransition();

  if (!signedIn) {
    return (
      <Link href={`/login?redirect_url=${encodeURIComponent(`/problems/${slug}`)}`} className={cls}>
        <Bookmark width={16} height={16} /> Save for later
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
      className={`${cls} disabled:cursor-wait ${on ? 'text-accent' : ''}`}
    >
      {pending ? <Spinner size={16} /> : <Bookmark width={16} height={16} filled={on} />}
      {pending ? 'Saving…' : on ? 'Saved' : 'Save for later'}
    </button>
  );
}
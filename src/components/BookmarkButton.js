'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { toggleBookmark } from '@/app/actions';
import { Bookmark } from './icons';

const cls =
  'inline-flex items-center gap-2 rounded-lg border border-line bg-surface px-3.5 py-2 text-sm font-semibold hover:bg-surface-2';

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
      disabled={pending}
      onClick={() =>
        start(async () => {
          const res = await toggleBookmark(problemId);
          if (res.ok) setOn(res.bookmarked);
        })
      }
      className={`${cls} ${on ? 'text-accent' : ''}`}
    >
      <Bookmark width={16} height={16} filled={on} /> {on ? 'Saved' : 'Save for later'}
    </button>
  );
}

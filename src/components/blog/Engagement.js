'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { toggleLike, submitHelpful } from '@/app/blog-actions';
import { ThumbUp } from '@/components/icons';

// Like + "Was this helpful?". Both need a signed-in user so one person cannot inflate the numbers.
export default function Engagement({ postId, signedIn, loginHref, liked: likedInit, likes: likesInit, helpful: helpfulInit, yes: yesInit, no: noInit }) {
  const [liked, setLiked] = useState(likedInit);
  const [likes, setLikes] = useState(likesInit);
  const [helpful, setHelpful] = useState(helpfulInit);
  const [counts, setCounts] = useState({ yes: yesInit, no: noInit });
  const [error, setError] = useState(null);
  const [pending, start] = useTransition();

  function like() {
    if (!signedIn) return;
    setError(null);
    start(async () => {
      const res = await toggleLike(postId);
      if (!res.ok) return setError(res.error);
      setLiked(res.liked);
      setLikes(res.count);
    });
  }

  function vote(value) {
    if (!signedIn) return;
    setError(null);
    start(async () => {
      const res = await submitHelpful(postId, value);
      if (!res.ok) return setError(res.error);
      setHelpful(value);
      setCounts({ yes: res.yes, no: res.no });
    });
  }

  const btn = (on) =>
    `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors disabled:opacity-60 ${
      on ? 'border-accent bg-accent-soft text-ink' : 'border-line bg-surface hover:bg-surface-2'
    }`;

  return (
    <section aria-labelledby="helpful-heading" className="mt-12 rounded-xl border border-line bg-surface p-5">
      <h2 id="helpful-heading" className="text-base font-semibold">Was this article helpful?</h2>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {signedIn ? (
          <>
            <button type="button" onClick={() => vote(true)} disabled={pending} aria-pressed={helpful === true} className={btn(helpful === true)}>
              Yes <span className="text-muted">{counts.yes}</span>
            </button>
            <button type="button" onClick={() => vote(false)} disabled={pending} aria-pressed={helpful === false} className={btn(helpful === false)}>
              No <span className="text-muted">{counts.no}</span>
            </button>
            <span className="mx-1 hidden h-6 w-px bg-line sm:block" aria-hidden="true" />
            <button type="button" onClick={like} disabled={pending} aria-pressed={liked} className={btn(liked)}>
              <ThumbUp width={16} height={16} /> {liked ? 'Liked' : 'Like'} <span className="text-muted">{likes}</span>
            </button>
          </>
        ) : (
          <p className="text-sm text-muted">
            <Link href={loginHref} className="font-semibold text-accent underline underline-offset-4">Sign in</Link> to rate this article or like it.
            {' '}{counts.yes} found it helpful · {likes} likes
          </p>
        )}
      </div>
      {error && <p role="alert" className="mt-3 text-sm text-hard">{error}</p>}
    </section>
  );
}

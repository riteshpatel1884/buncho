'use client';

import { useState, useTransition } from 'react';
import { shareAnswer, unshareAnswer } from '@/app/community-actions';

const primary = 'rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink disabled:opacity-50';
const secondary = 'rounded-md bg-line px-4 py-2 text-sm font-semibold hover:opacity-80 disabled:opacity-50';

/**
 * shared: null | { status: 'PUBLISHED' | 'UNSHARED' | 'HIDDEN', anonymous: boolean, outOfDate: boolean }
 */
export default function ShareControl({ problemId, hasSubmission, shared }) {
  const [anonymous, setAnonymous] = useState(shared?.anonymous ?? false);
  const [message, setMessage] = useState(null);
  const [pending, start] = useTransition();

  const live = shared?.status === 'PUBLISHED';
  const hidden = shared?.status === 'HIDDEN';
  const needsUpdate = live && (shared.outOfDate || anonymous !== shared.anonymous);

  function run(action, okText) {
    setMessage(null);
    start(async () => {
      const res = await action();
      setMessage(res.ok ? { type: 'ok', text: okText } : { type: 'error', text: res.error });
    });
  }

  return (
    <section aria-labelledby="share-heading" className="rounded-lg bg-surface-2 px-4 py-3">
      <h3 id="share-heading" className="text-sm font-semibold">Share with the community</h3>

      {!hasSubmission ? (
        <p className="mt-1 text-sm text-muted">Save your answer first. Then you can choose to share it. Answers stay private unless you share them.</p>
      ) : hidden ? (
        <p className="mt-1 text-sm text-hard">A moderator hid your shared answer after reviewing reports. It cannot be published again.</p>
      ) : (
        <>
          <p className="mt-1 text-sm text-muted">
            {live
              ? 'Your answer is public. Learners who have attempted this problem can read, upvote, comment on and report it.'
              : 'Sharing is optional. Your answer stays private unless you share it. You can stop sharing at any time.'}
          </p>
          {live && shared.outOfDate && (
            <p className="mt-2 text-sm font-medium text-medium">You edited your answer after sharing. The public version is still the older one.</p>
          )}

          <label className="mt-3 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
            Share anonymously (hide my name)
          </label>

          <div className="mt-4 flex flex-wrap gap-3">
            {!live && (
              <button type="button" disabled={pending} className={primary} onClick={() => run(() => shareAnswer(problemId, { anonymous }), 'Your answer is now public.')}>
                {pending ? 'Sharing…' : 'Share publicly'}
              </button>
            )}
            {needsUpdate && (
              <button type="button" disabled={pending} className={primary} onClick={() => run(() => shareAnswer(problemId, { anonymous }), 'Shared answer updated.')}>
                {pending ? 'Updating…' : 'Update shared answer'}
              </button>
            )}
            {live && (
              <button type="button" disabled={pending} className={secondary} onClick={() => run(() => unshareAnswer(problemId), 'Your answer is private again.')}>
                Stop sharing
              </button>
            )}
          </div>
        </>
      )}

      {message && (
        <p role={message.type === 'error' ? 'alert' : 'status'} className={`mt-3 text-sm ${message.type === 'error' ? 'text-hard' : 'text-easy'}`}>
          {message.text}
        </p>
      )}
    </section>
  );
}
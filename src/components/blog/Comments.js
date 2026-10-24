'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { addComment, deleteComment } from '@/app/blog-actions';
import { MAX_COMMENT_LENGTH } from '@/lib/blog-constants';

// comments: [{ id, content, author, when, canDelete }] already formatted by the server
export default function Comments({ postId, initial, signedIn, loginHref }) {
  const [comments, setComments] = useState(initial);
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [pending, start] = useTransition();

  function submit(e) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await addComment(postId, text);
      if (!res.ok) return setError(res.error);
      setComments((c) => [res.comment, ...c]);
      setText('');
    });
  }

  function remove(id) {
    start(async () => {
      const res = await deleteComment(id);
      if (res.ok) setComments((c) => c.filter((x) => x.id !== id));
      else setError(res.error);
    });
  }

  return (
    <section id="comments" aria-labelledby="comments-heading" className="mt-12 scroll-mt-24">
      <h2 id="comments-heading" className="text-xl font-semibold tracking-tight">Comments ({comments.length})</h2>

      {signedIn ? (
        <form onSubmit={submit} className="mt-4">
          <label htmlFor="comment-text" className="sr-only">Add a comment</label>
          <textarea
            id="comment-text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={MAX_COMMENT_LENGTH}
            rows={3}
            placeholder="Share a question or what worked for you"
            className="w-full rounded-lg border border-line bg-surface p-3 text-sm outline-none focus:border-accent"
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <span className="text-xs text-muted">{text.length}/{MAX_COMMENT_LENGTH}</span>
            <button type="submit" disabled={pending || text.trim().length < 2} className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink disabled:opacity-50">
              {pending ? 'Posting…' : 'Post comment'}
            </button>
          </div>
        </form>
      ) : (
        <p className="mt-3 text-sm text-muted">
          <Link href={loginHref} className="font-semibold text-accent underline underline-offset-4">Sign in</Link> to join the discussion.
        </p>
      )}
      {error && <p role="alert" className="mt-2 text-sm text-hard">{error}</p>}

      <ul className="mt-6 space-y-5">
        {comments.map((c) => (
          <li key={c.id} className="rounded-lg border border-line bg-surface p-4">
            <div className="flex items-center justify-between gap-3 text-xs text-muted">
              <span><span className="font-semibold text-ink">{c.author}</span> · {c.when}</span>
              {c.canDelete && (
                <button type="button" onClick={() => remove(c.id)} disabled={pending} className="font-medium text-hard hover:underline disabled:opacity-50">
                  Delete
                </button>
              )}
            </div>
            {/* Plain text: React escapes it, and whitespace-pre-wrap keeps line breaks */}
            <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-relaxed">{c.content}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}

'use client';

import { useEffect, useState, useTransition } from 'react';
import {
  toggleHelpful,
  toggleAnswerBookmark,
  reportAnswer,
  getComments,
  addComment,
  deleteComment,
} from '@/app/community-actions';
import { REPORT_REASONS, REPORT_REASON_LABEL, MAX_COMMENT_LENGTH, MAX_REPORT_DETAILS } from '@/lib/constants';
import { Bookmark, Chat, Flag, ThumbUp } from './icons';

const btn =
  'inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-sm font-semibold hover:bg-surface-2 disabled:opacity-50';
const field = 'w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm text-ink';

function CommentThread({ answerId, onCountChange }) {
  const [comments, setComments] = useState(null);
  const [text, setText] = useState('');
  const [error, setError] = useState(null);
  const [pending, start] = useTransition();

  useEffect(() => {
    let live = true;
    getComments(answerId).then((res) => {
      if (!live) return;
      if (res.ok) setComments(res.comments);
      else setError(res.error);
    });
    return () => {
      live = false;
    };
  }, [answerId]);

  function submit(e) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await addComment(answerId, text);
      if (res.ok) {
        setComments((c) => [...(c ?? []), res.comment]);
        setText('');
        onCountChange(1);
      } else {
        setError(res.error);
      }
    });
  }

  function remove(id) {
    setError(null);
    start(async () => {
      const res = await deleteComment(id);
      if (res.ok) {
        setComments((c) => c.filter((x) => x.id !== id));
        onCountChange(-1);
      } else {
        setError(res.error);
      }
    });
  }

  return (
    <div className="border-t border-line px-5 py-4">
      {comments === null && !error && <p className="text-sm text-muted">Loading discussion…</p>}
      {comments?.length === 0 && <p className="text-sm text-muted">No comments yet. Ask a question or add a suggestion.</p>}
      {comments?.length > 0 && (
        <ul className="space-y-3">
          {comments.map((c) => (
            <li key={c.id} className="rounded-lg bg-surface-2 px-3.5 py-2.5 text-sm">
              <p className="whitespace-pre-wrap break-words">{c.content}</p>
              <p className="mt-1.5 flex items-center gap-3 text-xs text-muted">
                <span>{c.author} · {c.dateLabel}</span>
                {c.mine && (
                  <button type="button" onClick={() => remove(c.id)} disabled={pending} className="font-semibold hover:text-hard">
                    Delete
                  </button>
                )}
              </p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={submit} className="mt-3">
        <label htmlFor={`c-${answerId}`} className="sr-only">Add a comment</label>
        <textarea
          id={`c-${answerId}`}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_COMMENT_LENGTH))}
          rows={2}
          placeholder="Add a comment or ask a question…"
          className={field}
        />
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-xs text-muted">{text.length} / {MAX_COMMENT_LENGTH}</span>
          <button type="submit" disabled={pending || !text.trim()} className={btn}>
            {pending ? 'Posting…' : 'Post comment'}
          </button>
        </div>
      </form>
      {error && <p role="alert" className="mt-2 text-sm text-hard">{error}</p>}
    </div>
  );
}

function ReportForm({ answerId, onDone }) {
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState(null);
  const [pending, start] = useTransition();

  function submit(e) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await reportAnswer(answerId, reason, details);
      if (res.ok) onDone();
      else setError(res.error);
    });
  }

  return (
    <form onSubmit={submit} className="space-y-3 border-t border-line px-5 py-4">
      <p className="text-sm text-muted">Reports are reviewed by a moderator. Please report only answers that break the rules.</p>
      <label className="block text-sm">
        <span className="font-medium">Reason</span>
        <select value={reason} onChange={(e) => setReason(e.target.value)} required className={`mt-1 ${field}`}>
          <option value="" disabled>Choose a reason</option>
          {REPORT_REASONS.map((r) => (
            <option key={r} value={r}>{REPORT_REASON_LABEL[r]}</option>
          ))}
        </select>
      </label>
      <label className="block text-sm">
        <span className="font-medium">Details (optional)</span>
        <textarea
          value={details}
          onChange={(e) => setDetails(e.target.value.slice(0, MAX_REPORT_DETAILS))}
          rows={2}
          className={`mt-1 ${field}`}
        />
      </label>
      <button type="submit" disabled={pending || !reason} className={btn}>
        {pending ? 'Sending…' : 'Send report'}
      </button>
      {error && <p role="alert" className="text-sm text-hard">{error}</p>}
    </form>
  );
}

export default function AnswerCard({ answer, children }) {
  const [helpful, setHelpful] = useState({ on: answer.voted, count: answer.helpful });
  const [saved, setSaved] = useState(answer.saved);
  const [reported, setReported] = useState(answer.reported);
  const [commentCount, setCommentCount] = useState(answer.commentCount);
  const [panel, setPanel] = useState(null); // 'discuss' | 'report' | null
  const [error, setError] = useState(null);
  const [pending, start] = useTransition();

  const initial = answer.author.charAt(0).toUpperCase();

  function onHelpful() {
    setError(null);
    start(async () => {
      const res = await toggleHelpful(answer.id);
      if (res.ok) setHelpful({ on: res.voted, count: res.count });
      else setError(res.error);
    });
  }

  function onSave() {
    setError(null);
    start(async () => {
      const res = await toggleAnswerBookmark(answer.id);
      if (res.ok) setSaved(res.saved);
      else setError(res.error);
    });
  }

  const toggle = (name) => setPanel((p) => (p === name ? null : name));

  return (
    <article id={`answer-${answer.id}`} className="scroll-mt-24 rounded-lg border border-line bg-surface">
      <header className="flex flex-wrap items-center gap-3 border-b border-line px-5 py-3">
        <span className="grid h-9 w-9 place-items-center rounded-full bg-accent-soft font-display font-bold text-accent" aria-hidden="true">
          {initial}
        </span>
        <div className="min-w-0">
          <p className="font-semibold">{answer.author}</p>
          <p className="text-sm text-muted">Shared {answer.dateLabel}</p>
        </div>
        <span className="ml-auto rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold text-muted">
          Community answer · not expert-verified
        </span>
      </header>

      <div className="px-5 py-5">{children}</div>

      <footer className="flex flex-wrap items-center gap-2 border-t border-line px-5 py-3">
        <button type="button" onClick={onHelpful} disabled={pending} aria-pressed={helpful.on} className={`${btn} ${helpful.on ? 'text-accent' : ''}`}>
          <ThumbUp width={16} height={16} /> Helpful · {helpful.count}
        </button>
        <button type="button" onClick={onSave} disabled={pending} aria-pressed={saved} className={`${btn} ${saved ? 'text-accent' : ''}`}>
          <Bookmark width={16} height={16} filled={saved} /> {saved ? 'Saved' : 'Save'}
        </button>
        <button type="button" onClick={() => toggle('discuss')} aria-expanded={panel === 'discuss'} className={btn}>
          <Chat width={16} height={16} /> Discuss · {commentCount}
        </button>
        {reported ? (
          <span className="ml-auto text-sm text-muted">Reported. Thank you.</span>
        ) : (
          <button type="button" onClick={() => toggle('report')} aria-expanded={panel === 'report'} className={`${btn} ml-auto`}>
            <Flag width={16} height={16} /> Report
          </button>
        )}
      </footer>

      {error && <p role="alert" className="border-t border-line px-5 py-3 text-sm text-hard">{error}</p>}

      {panel === 'discuss' && (
        <CommentThread answerId={answer.id} onCountChange={(d) => setCommentCount((n) => Math.max(0, n + d))} />
      )}
      {panel === 'report' && !reported && (
        <ReportForm
          answerId={answer.id}
          onDone={() => {
            setReported(true);
            setPanel(null);
          }}
        />
      )}
    </article>
  );
}
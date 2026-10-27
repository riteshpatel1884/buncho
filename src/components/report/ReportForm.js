'use client';

import { useEffect, useState, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchProblemsForReport, submitReport } from '@/app/report/actions';
import { ISSUES, KIND_HELP, KIND_LABEL, MAX_DETAILS, MIN_DETAILS, SUPPORT_KINDS } from '@/lib/support';
import { formatMoney } from '@/lib/money';
import Spinner from '@/components/Spinner';

const input =
  'w-full rounded-xl border border-line bg-surface-2/40 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted/70 focus:border-accent focus:bg-surface focus:ring-4 focus:ring-accent/15';
const label = 'text-sm font-medium';

const PAYMENT_STATUS = { PAID: 'Paid', PENDING: 'Pending', FAILED: 'Failed' };
const dateFmt = (iso) => new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', timeZone: 'Asia/Kolkata' });

export default function ReportForm({ initialKind, initialIssue, initialProblem, accountEmail, proUntil, payments }) {
  const router = useRouter();
  const [kind, setKind] = useState(initialKind);
  const [issue, setIssue] = useState(() =>
    initialKind && ISSUES[initialKind].some((i) => i.id === initialIssue) ? initialIssue : '',
  );
  const [problem, setProblem] = useState(initialProblem); // { id, slug, title } or null
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [details, setDetails] = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [noTransaction, setNoTransaction] = useState(false);
  const [email, setEmail] = useState(accountEmail);
  const [error, setError] = useState(null);
  const [doneRef, setDoneRef] = useState(null);
  const [pending, start] = useTransition();

  // Search for the question while the learner types (after a short pause)
  useEffect(() => {
    if (kind !== 'PROBLEM' || problem) return undefined;
    const q = query.trim();
    if (q.length < 2) {
      setResults([]);
      setSearching(false);
      return undefined;
    }
    let cancelled = false;
    setSearching(true);
    const timer = setTimeout(async () => {
      const rows = await searchProblemsForReport(q).catch(() => []);
      if (!cancelled) {
        setResults(rows);
        setSearching(false);
      }
    }, 250);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, kind, problem]);

  function chooseKind(next) {
    setKind(next);
    setIssue('');
    setError(null);
  }

  const issueDef = kind ? ISSUES[kind].find((i) => i.id === issue) : null;
  const ready =
    kind &&
    issue &&
    details.trim().length >= MIN_DETAILS &&
    (kind !== 'PROBLEM' || problem) &&
    (kind !== 'PRO_PLAN' || !issueDef?.needsTransaction || transactionId.trim() || noTransaction);

  function submit(e) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await submitReport({
        kind,
        issue,
        problemId: problem?.id,
        details,
        transactionId,
        noTransaction,
        contactEmail: email,
      });
      if (!res.ok) return setError(res.error);
      setDoneRef(res.ref);
      router.refresh(); // so "Your reports" below picks up the new report
    });
  }

  function reset() {
    setDoneRef(null);
    setKind(null);
    setIssue('');
    setProblem(null);
    setQuery('');
    setDetails('');
    setTransactionId('');
    setNoTransaction(false);
    setError(null);
  }

  if (doneRef) {
    return (
      <div className="rounded-2xl border border-accent/40 bg-accent-soft p-6 sm:p-8">
        <h2 className="text-xl font-semibold tracking-tight">Thank you. Your report is sent.</h2>
        <p className="mt-2 text-sm text-muted">
          Reference <span className="font-mono font-semibold text-ink">{doneRef}</span>. We will look into it. You can follow the status, and read our reply, under &ldquo;Your reports&rdquo; below.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button type="button" onClick={reset} className="rounded-full border border-line bg-surface px-5 py-2.5 text-sm font-semibold hover:bg-surface-2">
            Send another report
          </button>
          <Link href="/problems" className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink hover:opacity-90">
            Back to problems
          </Link>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-8">
      {/* 1. What are you reporting */}
      <fieldset>
        <legend className="text-base font-semibold">What do you want to report?</legend>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {SUPPORT_KINDS.map((k) => {
            const on = kind === k;
            return (
              <button
                key={k}
                type="button"
                aria-pressed={on}
                onClick={() => chooseKind(k)}
                className={`rounded-2xl border p-4 text-left transition-colors ${
                  on ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-muted'
                }`}
              >
                <span className="block text-sm font-semibold">{KIND_LABEL[k]}</span>
                <span className="mt-1 block text-xs text-muted">{KIND_HELP[k]}</span>
              </button>
            );
          })}
        </div>
      </fieldset>

      {kind && (
        <div className="space-y-6 rounded-2xl border border-line bg-surface p-5 sm:p-6">
          {/* Which question */}
          {kind === 'PROBLEM' && (
            <div>
              <p className={label}>Which question?</p>
              {problem ? (
                <div className="mt-2 flex items-center justify-between gap-3 rounded-xl border border-accent/40 bg-accent-soft px-3.5 py-2.5">
                  <span className="min-w-0 truncate text-sm font-medium">{problem.title}</span>
                  <button type="button" onClick={() => setProblem(null)} className="shrink-0 text-xs font-semibold text-accent hover:underline">
                    Change
                  </button>
                </div>
              ) : (
                <div className="mt-2">
                  <input
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    maxLength={80}
                    placeholder="Search the question by title or keyword"
                    aria-label="Search for the question"
                    className={input}
                    autoComplete="off"
                  />
                  {searching && <p className="mt-2 text-xs text-muted">Searching…</p>}
                  {!searching && query.trim().length >= 2 && results.length === 0 && (
                    <p className="mt-2 text-xs text-muted">No question matches that. Try other words.</p>
                  )}
                  {results.length > 0 && (
                    <ul className="mt-2 divide-y divide-line overflow-hidden rounded-xl border border-line">
                      {results.map((r) => (
                        <li key={r.id}>
                          <button
                            type="button"
                            onClick={() => {
                              setProblem({ id: r.id, slug: r.slug, title: r.title });
                              setResults([]);
                              setQuery('');
                            }}
                            className="flex w-full items-start justify-between gap-3 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-surface-2"
                          >
                            <span className="min-w-0">
                              <span className="block font-medium">{r.title}</span>
                              <span className="block text-xs text-muted">{r.topic.name}</span>
                            </span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* What is wrong */}
          <div>
            <label htmlFor="issue" className={label}>What is wrong?</label>
            <select id="issue" value={issue} onChange={(e) => setIssue(e.target.value)} className={`${input} mt-2`}>
              <option value="">Choose one…</option>
              {ISSUES[kind].map((i) => (
                <option key={i.id} value={i.id}>{i.label}</option>
              ))}
            </select>
          </div>

          {/* Payment details for Pro reports */}
          {kind === 'PRO_PLAN' && (
            <div className="space-y-4 rounded-xl bg-surface-2/60 p-4">
              <p className="text-sm">
                {proUntil ? (
                  <>Your account shows Pro active until <span className="font-semibold">{dateFmt(proUntil)}</span>.</>
                ) : (
                  <>Your account does not show an active Pro plan right now.</>
                )}
              </p>

              {payments.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-muted">Your recent payments (tap one to use it)</p>
                  <ul className="mt-2 space-y-2">
                    {payments.map((p) => {
                      const on = transactionId === p.orderId;
                      return (
                        <li key={p.orderId}>
                          <button
                            type="button"
                            aria-pressed={on}
                            onClick={() => {
                              setTransactionId(p.orderId);
                              setNoTransaction(false);
                            }}
                            className={`flex w-full flex-wrap items-center justify-between gap-2 rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                              on ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-muted'
                            }`}
                          >
                            <span className="tabular-nums">{dateFmt(p.createdAt)} · {formatMoney(p.amountPaise, p.currency)}</span>
                            <span className="text-xs font-semibold text-muted">{PAYMENT_STATUS[p.status] ?? p.status}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              <div>
                <label htmlFor="txn" className={label}>
                  Payment transaction ID{issueDef?.needsTransaction ? '' : ' (optional)'}
                </label>
                <input
                  id="txn"
                  value={transactionId}
                  onChange={(e) => {
                    setTransactionId(e.target.value);
                    if (e.target.value) setNoTransaction(false);
                  }}
                  maxLength={64}
                  placeholder="UPI reference (UTR), Cashfree or Dodo payment ID, or order ID"
                  className={`${input} mt-2`}
                  autoComplete="off"
                />
                <p className="mt-1.5 text-xs text-muted">You can find it in your UPI app, bank SMS or payment email. It helps us fix this much faster.</p>
                {issueDef?.needsTransaction && (
                  <label className="mt-2 flex items-center gap-2 text-xs text-muted">
                    <input
                      type="checkbox"
                      checked={noTransaction}
                      onChange={(e) => setNoTransaction(e.target.checked)}
                      className="h-4 w-4 accent-accent"
                    />
                    I can&rsquo;t find it
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Details */}
          <div>
            <label htmlFor="details" className={label}>Tell us more</label>
            <textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={5}
              maxLength={MAX_DETAILS}
              placeholder={
                kind === 'PROBLEM'
                  ? 'What is incorrect, and what should it say instead?'
                  : kind === 'PRO_PLAN'
                    ? 'What happened? For example: when you paid, how you paid, and what you see now.'
                    : 'Describe what happened or what you would like to see.'
              }
              className={`${input} mt-2 resize-y`}
            />
            <p className="mt-1 text-right text-xs text-muted tabular-nums">{details.length} / {MAX_DETAILS}</p>
          </div>

          {/* Contact */}
          <div>
            <label htmlFor="email" className={label}>Contact email (optional)</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              maxLength={120}
              placeholder="you@example.com"
              className={`${input} mt-2`}
            />
          </div>

          {error && (
            <p role="alert" className="rounded-xl border border-hard/40 bg-hard/10 px-4 py-3 text-sm font-medium text-hard">{error}</p>
          )}

          <button
            type="submit"
            disabled={pending || !ready}
            aria-busy={pending}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-ink transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {pending && <Spinner size={14} />}
            {pending ? 'Sending…' : 'Send report'}
          </button>
        </div>
      )}
    </form>
  );
}
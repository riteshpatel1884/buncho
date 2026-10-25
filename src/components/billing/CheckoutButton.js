'use client';

import { useState, useTransition } from 'react';
import { previewPrice, startCheckout } from '@/app/billing-actions';
import Spinner from '@/components/Spinner';
import { ctaBtn } from '@/components/jobs/ui';

const SDK = 'https://sdk.cashfree.com/js/v3/cashfree.js';

function loadSdk() {
  if (typeof window !== 'undefined' && window.Cashfree) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = SDK;
    s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error('Could not load the payment window. Check your connection and try again.'));
    document.head.appendChild(s);
  });
}

// price: rupees the buyer pays now (site-wide offer already included). open: false when the admin paused upgrades.
export default function CheckoutButton({ signedIn, label = 'Upgrade to Pro', price, open = true }) {
  const [codeOpen, setCodeOpen] = useState(false);
  const [code, setCode] = useState('');
  const [applied, setApplied] = useState(null); // { code, finalRupees, message }
  const [codeError, setCodeError] = useState(null);
  const [error, setError] = useState(null);
  const [pending, start] = useTransition();
  const [checking, startCheck] = useTransition();
  const [redirecting, setRedirecting] = useState(false);

  if (!signedIn) {
    return (
      <a href={`/login?redirect_url=${encodeURIComponent('/pricing')}`} className={`${ctaBtn} w-full`}>
        Log in to upgrade
      </a>
    );
  }

  if (!open) {
    return <p className="rounded-xl bg-surface/70 px-4 py-3 text-center text-sm text-muted">Upgrades are paused for a short while. Please check back soon.</p>;
  }

  function apply() {
    setCodeError(null);
    startCheck(async () => {
      try {
        const res = await previewPrice({ code });
        if (!res.ok) {
          setApplied(null);
          return setCodeError(res.error);
        }
        setApplied(res);
      } catch (err) {
        console.error(err);
        setApplied(null);
        setCodeError('Could not check that code right now. Please try again.');
      }
    });
  }

  function removeCode() {
    setApplied(null);
    setCode('');
    setCodeError(null);
  }

  function pay(e) {
    e.preventDefault();
    setError(null);
    start(async () => {
      try {
        const res = await startCheckout({ code: applied ? applied.code : '' });
        if (!res.ok) return setError(res.error);
        await loadSdk();
        const cashfree = window.Cashfree({ mode: res.mode });
        setRedirecting(true);
        await cashfree.checkout({ paymentSessionId: res.paymentSessionId, redirectTarget: '_self' });
      } catch (err) {
        // Catch everything here so a failure shows a message instead of crashing the whole page.
        console.error(err);
        setRedirecting(false);
        setError(err?.message || 'Could not open the payment window. Please try again.');
      }
    });
  }

  const busy = pending || redirecting;
  const shown = applied ? applied.finalRupees : price;

  return (
    <form onSubmit={pay} className="space-y-3">
      {applied ? (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-accent/40 bg-accent-soft px-3.5 py-2.5 text-sm">
          <span className="font-medium text-accent">{applied.message}</span>
          <button type="button" onClick={removeCode} disabled={busy} className="text-xs font-semibold text-muted hover:text-ink">
            Remove
          </button>
        </div>
      ) : codeOpen ? (
        <div>
          <label htmlFor="promo-code" className="text-xs font-medium text-muted">Promo code</label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="promo-code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={24}
              autoComplete="off"
              placeholder="ENTER CODE"
              disabled={busy || checking}
              className="min-w-0 flex-1 rounded-xl border border-line bg-surface-2/40 px-3.5 py-2.5 text-sm uppercase tracking-wider outline-none transition placeholder:normal-case placeholder:tracking-normal placeholder:text-muted/70 focus:border-accent focus:bg-surface focus:ring-4 focus:ring-accent/15 disabled:opacity-60"
            />
            <button
              type="button"
              onClick={apply}
              disabled={busy || checking || !code.trim()}
              className="rounded-xl border border-line bg-surface px-4 text-sm font-semibold hover:bg-surface-2 disabled:opacity-50"
            >
              {checking ? 'Checking…' : 'Apply'}
            </button>
          </div>
          {codeError && <p role="alert" className="mt-1.5 text-xs text-hard">{codeError}</p>}
        </div>
      ) : (
        <button type="button" onClick={() => setCodeOpen(true)} className="text-xs font-semibold text-accent hover:underline">
          Have a promo code?
        </button>
      )}

      <button type="submit" disabled={busy} aria-busy={busy} className={`${ctaBtn} w-full`}>
        {busy && <Spinner size={14} />}
        {busy ? 'Opening payment…' : shown != null ? `${label} · ₹${shown}` : label}
      </button>
      {error && <p role="alert" className="text-xs text-hard">{error}</p>}
      <p className="text-center text-[0.7rem] text-muted">Secure payment by Cashfree. UPI, cards and net banking.</p>
    </form>
  );
}
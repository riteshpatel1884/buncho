'use client';

import { useState, useTransition } from 'react';
import { startCheckout } from '@/app/billing-actions';
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

export default function CheckoutButton({ signedIn, label = 'Upgrade to Pro', price }) {
  const [phone, setPhone] = useState('');
  const [error, setError] = useState(null);
  const [pending, start] = useTransition();
  const [redirecting, setRedirecting] = useState(false);

  if (!signedIn) {
    return (
      <a href={`/login?redirect_url=${encodeURIComponent('/pricing')}`} className={`${ctaBtn} w-full`}>
        Log in to upgrade
      </a>
    );
  }

  function pay(e) {
    e.preventDefault();
    setError(null);
    start(async () => {
      const res = await startCheckout({ phone });
      if (!res.ok) return setError(res.error);
      try {
        await loadSdk();
        const cashfree = window.Cashfree({ mode: res.mode });
        setRedirecting(true);
        await cashfree.checkout({ paymentSessionId: res.paymentSessionId, redirectTarget: '_self' });
      } catch (err) {
        setRedirecting(false);
        setError(err?.message || 'Could not open the payment window.');
      }
    });
  }

  const busy = pending || redirecting;

  return (
    <form onSubmit={pay} className="space-y-3">
      <div>
        <label htmlFor="pay-phone" className="text-xs font-medium text-muted">Mobile number (needed by our payment provider)</label>
        <input
          id="pay-phone"
          type="tel"
          inputMode="numeric"
          autoComplete="tel-national"
          maxLength={14}
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="98765 43210"
          disabled={busy}
          className="mt-1.5 w-full rounded-xl border border-line bg-surface-2/40 px-3.5 py-2.5 text-sm outline-none transition placeholder:text-muted/70 focus:border-accent focus:bg-surface focus:ring-4 focus:ring-accent/15 disabled:opacity-60"
        />
      </div>
      <button type="submit" disabled={busy} aria-busy={busy} className={`${ctaBtn} w-full`}>
        {busy && <Spinner size={14} />}
        {busy ? 'Opening payment…' : price ? `${label} · ${price}` : label}
      </button>
      {error && <p role="alert" className="text-xs text-hard">{error}</p>}
      <p className="text-center text-[0.7rem] text-muted">Secure payment by Cashfree. UPI, cards and net banking.</p>
    </form>
  );
}
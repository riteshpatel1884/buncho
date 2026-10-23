import Link from 'next/link';
import { getOrCreateUser } from '@/lib/user';
import { getEntitlements } from '@/lib/subscription';
import { PRO_PERIOD_DAYS, PRO_PRICE_INR } from '@/lib/constants';
import CheckoutButton from '@/components/billing/CheckoutButton';
import { BackLink, Eyebrow, Gradient, Hero, card } from '@/components/jobs/ui';
import { Check, Lock } from '@/components/icons';
import { buildMetadata } from '@/lib/seo';

export const metadata = buildMetadata({
  title: 'Pricing',
  description: 'Start free with one role plan and one mock assessment. Upgrade to Buncho Pro for more roles, unlimited mock assessments and interview insights.',
  path: '/pricing',
});

const FREE = [
  '1 role preparation plan',
  '1 mock assessment attempt total',
  'Full result and AI feedback for that attempt',
  'Access to the matched question bank',
  'Basic progress tracking',
];

const PRO = [
  'Multiple role preparation plans',
  'Unlimited mock assessment attempts while subscribed',
  'AI feedback after every assessment',
  'Assessment history and score comparisons',
  'Company-wise question insights',
  'Question frequency data',
  'Advanced preparation and revision features',
];

const dateFmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Kolkata' });

function Item({ children, locked = false }) {
  return (
    <li className="flex items-start gap-2.5 text-sm">
      <span className={`mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full ${locked ? 'text-muted' : 'bg-accent-soft text-accent'}`}>
        {locked ? <Lock width={12} height={12} /> : <Check width={10} height={10} strokeWidth={3.5} />}
      </span>
      <span className={locked ? 'text-muted' : ''}>{children}</span>
    </li>
  );
}

export default async function PricingPage() {
  const user = await getOrCreateUser();
  const ent = await getEntitlements(user?.id ?? null);

  return (
    <div className="mx-auto w-full max-w-5xl px-4 pb-20 pt-6 sm:px-6">
      <BackLink href="/problems">Problems</BackLink>

      <Hero className="mt-3" aria-labelledby="pricing-h1">
        <div className="px-6 py-9 sm:px-10 sm:py-12">
          <Eyebrow>Pricing</Eyebrow>
          <h1 id="pricing-h1" className="mt-4 text-3xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Start free. <Gradient>Upgrade when you&rsquo;re ready.</Gradient>
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted">
            Try Buncho with one role and one full mock assessment, including the complete result and AI feedback. Upgrade for more roles, unlimited mocks and interview insights.
          </p>
        </div>
      </Hero>

      <div className="mt-6 grid items-start gap-5 md:grid-cols-2">
        <section aria-labelledby="free-h" className={`${card} p-6 sm:p-7`}>
          <div className="flex items-center justify-between gap-3">
            <h2 id="free-h" className="text-lg font-semibold">Free</h2>
            <span className="rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-semibold">₹0</span>
          </div>
          <p className="mt-1 text-sm text-muted">Try Buncho before paying</p>
          <ul className="mt-5 space-y-3 border-t border-line pt-5">
            {FREE.map((f) => <Item key={f}>{f}</Item>)}
            <Item locked>Additional roles and mock attempts require Pro</Item>
          </ul>
          {user && !ent.isPro && (
            <div className="mt-6 rounded-xl bg-surface-2/60 px-4 py-3 text-sm">
              <p className="font-semibold">Your free plan right now</p>
              <p className="mt-1 text-muted">Roles {ent.roles.used}/{ent.roles.limit} · Mock assessments {Math.min(ent.mocks.used, ent.mocks.limit)}/{ent.mocks.limit}</p>
            </div>
          )}
          {!user && (
            <Link href="/register" className="mt-6 inline-flex w-full items-center justify-center rounded-full border border-line px-5 py-3 text-sm font-semibold transition-colors hover:border-muted">
              Sign up free
            </Link>
          )}
        </section>

        <section
          aria-labelledby="pro-h"
          className="relative overflow-hidden rounded-2xl border border-accent/40 p-6 sm:p-7"
          style={{ background: 'linear-gradient(160deg, var(--accent-soft), var(--surface) 65%)' }}
        >
          <div className="flex items-center justify-between gap-3">
            <h2 id="pro-h" className="text-lg font-semibold">Buncho Pro</h2>
            <span className="rounded-full bg-accent px-2.5 py-0.5 text-xs font-semibold text-accent-ink">{ent.isPro ? 'Active' : 'Paid'}</span>
          </div>
          <p className="mt-3 text-3xl font-semibold tabular-nums tracking-tight">
            ₹{PRO_PRICE_INR} <span className="text-sm font-normal text-muted">/ {PRO_PERIOD_DAYS} days</span>
          </p>
          <ul className="mt-5 space-y-3 border-t border-line pt-5">
            {PRO.map((f) => <Item key={f}>{f}</Item>)}
          </ul>

          <div className="mt-6">
            {ent.isPro && (
              <p className="mb-4 rounded-xl bg-surface/70 px-4 py-3 text-sm">
                Pro is active until <span className="font-semibold">{dateFmt(ent.periodEnd)}</span>. Paying again adds {PRO_PERIOD_DAYS} more days on top.
              </p>
            )}
            <CheckoutButton signedIn={Boolean(user)} label={ent.isPro ? `Add ${PRO_PERIOD_DAYS} days` : 'Upgrade to Pro'} price={`₹${PRO_PRICE_INR}`} />
          </div>
        </section>
      </div>

      <p className="mx-auto mt-8 max-w-2xl text-center text-xs text-muted">
        Each payment gives {PRO_PERIOD_DAYS} days of Pro and does not renew automatically. Your answers, plans and results are kept if Pro ends. You just cannot add roles or start new mock assessments beyond the free limits.
      </p>
    </div>
  );
}
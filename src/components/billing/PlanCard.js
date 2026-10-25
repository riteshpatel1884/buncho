import Link from 'next/link';
import Section from '@/components/dashboard/Section';
import { ProBadge } from '@/components/ProBadge';

const dateFmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'Asia/Kolkata' });

export default function PlanCard({ ent }) {
  if (ent.isPro) {
    return (
      <Section
        id="plan-h"
        title="Your plan"
        action={{ href: '/pricing', label: 'Extend' }}
        className="!border-amber-400/60 bg-gradient-to-br from-amber-50 to-white shadow-md shadow-amber-500/10 dark:from-[#2d230a] dark:to-[#1f1b12]"
      >
        <p className="flex items-center gap-2 text-sm font-semibold">
          Buncho Pro <ProBadge />
        </p>
        <p className="mt-1 text-sm text-muted">Renews by paying again. Active until {dateFmt(ent.periodEnd)}.</p>
      </Section>
    );
  }
  return (
    <Section id="plan-h" title="Your plan" action={{ href: '/pricing', label: 'Upgrade' }}>
      <p className="text-sm font-semibold">Free</p>
      <ul className="mt-2 space-y-1 text-sm text-muted">
        <li>Role plans: {ent.roles.used}/{ent.roles.limit}</li>
        <li>Mock assessments: {Math.min(ent.mocks.used, ent.mocks.limit)}/{ent.mocks.limit}</li>
      </ul>
      <Link href="/pricing" className="mt-4 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:opacity-90">
        See Pro
      </Link>
    </Section>
  );
}
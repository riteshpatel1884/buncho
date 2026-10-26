import Link from 'next/link';
import Section from '@/components/dashboard/Section';
import { Check } from '@/components/icons';

const PRO_PERKS = [
  'Pro-only system design and case study questions',
  'Multiple role preparation plans',
  'Unlimited mock assessments',
  'Company-wise question insights',
  'Question frequency data',
  'Advanced revision',
];

export default function PlanCard({ ent }) {
  if (ent.isPro) {
    return (
      <Section id="plan-h" title="Your plan" action={{ href: '/pricing', label: 'Extend' }} className="!border-amber-400/40">
        <ul className="space-y-2.5">
          {PRO_PERKS.map((p) => (
            <li key={p} className="flex items-center gap-2.5 text-sm">
              <span className="grid h-4 w-4 shrink-0 place-items-center rounded-full bg-amber-400/20 text-amber-600 dark:text-amber-300">
                <Check width={10} height={10} strokeWidth={3.5} />
              </span>
              {p}
            </li>
          ))}
        </ul>
        <p className="mt-4 border-t border-line pt-4 text-xs text-muted">
          Pro does not renew automatically. Each payment adds more time on top.
        </p>
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
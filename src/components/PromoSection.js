import Link from 'next/link';
import AdCard from '@/components/ads/AdCard';
import { AD_SLOTS, AD_STATS, SLOT_KEYS, slotPriceCents, usd } from '@/lib/ads';

function EmptySlot({ slot }) {
  const { n } = AD_SLOTS[slot];
  return (
    <Link
      href={`/advertise?slot=${n}`}
      className="group flex h-full min-h-44 flex-col justify-between rounded-2xl border border-dashed border-accent/40 bg-gradient-to-br from-accent-soft to-surface p-4 transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-lg hover:shadow-accent/5 sm:p-5"
    >
      <div>
        <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-accent">Your banner here</p>
        <h3 className="mt-3 text-base font-semibold leading-snug">Promote your SaaS</h3>
        <p className="mt-1 text-xs text-muted">
          Reach {AD_STATS.visitors}+ AI and ML engineers every week, right at the top of our question library.
        </p>
      </div>
      <span className="mt-4 inline-flex w-fit items-center rounded-xl bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink group-hover:opacity-90">
        {usd(slotPriceCents(slot))} / month <span aria-hidden="true" className="ml-1">→</span>
      </span>
    </Link>
  );
}

// The two-column sponsor section on /problems. A live banner fills a column, an empty column invites advertisers.
export default function PromoSection({ ads = {} }) {
  return (
    <section aria-label="Sponsored" className="flex flex-col rounded-2xl border border-line bg-surface-2/40 p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted">Sponsored</p>
        <Link href="/advertise" className="text-xs font-semibold text-accent hover:underline">
          Advertise with us
        </Link>
      </div>
      <div className="grid flex-1 gap-3 sm:grid-cols-2">
        {SLOT_KEYS.map((slot) => (ads[slot] ? <AdCard key={slot} ad={ads[slot]} /> : <EmptySlot key={slot} slot={slot} />))}
      </div>
    </section>
  );
}
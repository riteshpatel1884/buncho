import Link from "next/link";
import ProductLogo from "./ProductLogo";
import VoteButton from "./VoteButton";
import VerifiedBadge from "./VerifiedBadge";
import Countdown from "./Countdown";

export default function DailyPickCard({ pick, voted = false }) {
  const p = pick.product;
  const founder = p.user.name || p.user.username || "a founder";
  return (
    <section className="rise relative overflow-hidden rounded-3xl border border-brand/40 bg-surface p-5 sm:p-8">
      <div aria-hidden="true" className="aurora pointer-events-none absolute inset-0 opacity-70" />
      <div className="relative space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand px-3 py-1 text-sm font-bold text-on-brand">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="4" />
              <circle cx="8.5" cy="8.5" r="1" fill="currentColor" />
              <circle cx="15.5" cy="15.5" r="1" fill="currentColor" />
              <circle cx="12" cy="12" r="1" fill="currentColor" />
            </svg>
            Daily Pick
          </span>
          <span className="text-sm text-muted">
            Featured for the next <span className="font-semibold text-ink"><Countdown endsAt={pick.endsAt.toISOString()} /></span>
          </span>
        </div>

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <ProductLogo product={p} size={80} />
          <div className="min-w-0 flex-1">
            <h2 className="flex flex-wrap items-center gap-2 font-display text-2xl font-bold leading-tight sm:text-3xl">
              {p.name}
              {p.verified && <VerifiedBadge className="h-6 w-6" />}
            </h2>
            <p className="mt-1 text-muted sm:text-lg">{p.tagline}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-medium">
              <span className="rounded-full bg-mint-soft px-3 py-1 text-mint">{p.category.name}</span>
              {p.pricing && <span className="rounded-full border border-line px-3 py-1 text-muted">{p.pricing}</span>}
              <span className="text-muted">Built by {founder}</span>
            </div>
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <a href={`/go/${p.slug}`} target="_blank" rel="noopener" className="btn-primary">Visit website</a>
              <Link href={`/products/${p.slug}`} className="btn-outline">See details</Link>
            </div>
          </div>
          <VoteButton productId={p.id} initialCount={p._count.votes} initialVoted={voted} size="lg" />
        </div>

        <p className="text-sm text-muted">
          Every founder gets one turn per round, in random order. Not for sale.{" "}
          <Link href="/ranking" className="font-medium text-brand hover:underline">How picks work</Link>
        </p>
      </div>
    </section>
  );
}
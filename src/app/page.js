import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ExpertCard from "@/components/ExpertCard";
import { SERVICE_TYPES, SERVICE_BLURBS, inr } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [featured, byType, expertCount] = await Promise.all([
    prisma.expertProfile.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 3,
      include: {
        user: { select: { name: true, avatarUrl: true } },
        services: { where: { active: true }, select: { type: true, title: true, priceInr: true } },
      },
    }),
    prisma.service.groupBy({
      by: ["type"],
      where: { active: true, expert: { status: "ACTIVE" } },
      _min: { priceInr: true },
      _count: { _all: true },
    }),
    prisma.expertProfile.count({ where: { status: "ACTIVE" } }),
  ]);
  const typeInfo = new Map(byType.map((t) => [t.type, t]));

  return (
    <div className="space-y-10 sm:space-y-14">
      {/* Hero */}
      <section
        className="glow relative grid grid-cols-1 gap-10 overflow-hidden rounded-3xl bg-navy p-6 text-white sm:p-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center lg:p-12"
        style={{ backgroundImage: "radial-gradient(circle at 88% 8%, rgba(52,214,123,0.22), transparent 42%)" }}
      >
        <div aria-hidden="true" className="dots pointer-events-none absolute inset-0" />
        <div aria-hidden="true" className="spot" />
        <div aria-hidden="true" className="blob pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#34d67b]/20 blur-3xl" />

        <div className="rise relative">
          <h1 className="font-display text-4xl font-bold leading-[1.05] sm:text-5xl lg:text-6xl">
            Get help from people who've <span className="text-shimmer">already done it.</span>
          </h1>
          <p className="mt-4 max-w-md text-lg text-on-navy">
            Book verified seniors and professionals for resume reviews, mock interviews and career guidance.
          </p>
          <form action="/experts" data-nav className="mt-7 flex max-w-lg flex-col gap-2 sm:flex-row">
            <input
              name="q"
              placeholder="I want an AI internship but my resume isn't getting shortlisted"
              aria-label="Describe what you need help with"
              className="w-full rounded-full bg-surface px-5 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-white/60"
            />
            <button className="btn-primary btn-ring shrink-0">Find experts</button>
          </form>
          <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-on-navy">
            <Link href="/onboarding/expert" className="btn-onnavy !py-2">Become an expert</Link>
            <span>{expertCount} {expertCount === 1 ? "expert" : "experts"} verified and live</span>
          </div>
        </div>

        <div className="rise relative rounded-2xl bg-surface p-5 text-ink shadow-xl" style={{ "--i": 2 }}>
          <h2 className="font-display text-lg font-bold">New experts</h2>
          {featured.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">Experts are joining now. Be one of the first.</p>
          ) : (
            <ul className="mt-3 space-y-1">
              {featured.map((e) => (
                <li key={e.id}>
                  <Link href={`/experts/${e.slug}`} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-2">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mint-soft font-bold text-mint">{(e.user.name || "?")[0]}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{e.user.name}</span>
                      <span className="block truncate text-xs text-muted">{e.jobTitle} at {e.company}</span>
                    </span>
                    {e.services.length > 0 && <span className="text-sm font-semibold text-brand">{inr(Math.min(...e.services.map((s) => s.priceInr)))}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* What you can book */}
      <section className="space-y-5">
        <div>
          <h2 className="font-display text-2xl font-bold sm:text-3xl">What do you need help with?</h2>
          <p className="mt-1 text-muted">Pick a service to see experts who offer it.</p>
        </div>
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(SERVICE_TYPES).filter(([k]) => k !== "OTHER").map(([key, label], i) => {
            const info = typeInfo.get(key);
            return (
              <li key={key} className="rise" style={{ "--i": i }}>
                <Link href={`/experts?service=${key}`} className="card card-hover glow flex h-full flex-col gap-2 p-5">
                  <h3 className="font-display text-lg font-bold">{label}</h3>
                  <p className="text-sm text-muted">{SERVICE_BLURBS[key]}</p>
                  <p className="mt-auto pt-3 text-sm font-medium text-brand">
                    {info ? `${info._count._all} ${info._count._all === 1 ? "offer" : "offers"}, from ${inr(info._min.priceInr)}` : "Coming soon"}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {featured.length > 0 && (
        <section className="space-y-5">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Meet the experts</h2>
            <Link href="/experts" className="text-sm font-medium text-brand hover:underline">See all</Link>
          </div>
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {featured.map((e, i) => <ExpertCard key={e.id} expert={e} index={i} />)}
          </ul>
        </section>
      )}

      {/* How it works */}
      <section className="card reveal p-6 sm:p-10">
        <h2 className="font-display text-2xl font-bold">How it works</h2>
        <ol className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            ["Find", "Describe your problem or filter by college, role and service. Experts are checked by Buncho."],
            ["Book", "Pick a service and a time that suits you. The expert confirms and shares a meeting link."],
            ["Improve", "Get a resume review, a mock interview or advice from someone who has been where you are."],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint-soft font-display font-bold text-mint">{i + 1}</span>
              <div>
                <p className="font-semibold">{t}</p>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Expert call to action */}
      <section className="aurora reveal card relative grid grid-cols-1 items-center gap-6 overflow-hidden p-6 sm:p-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:p-12">
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">Been there? Help someone get there.</h2>
          <p className="mt-3 max-w-md text-muted">
            Placed at a company, cleared a tough interview or built something real? Set your own prices and help students from your college.
          </p>
        </div>
        <div>
          <Link href="/onboarding/expert" className="btn-primary btn-ring">Become an expert</Link>
        </div>
      </section>
    </div>
  );
}

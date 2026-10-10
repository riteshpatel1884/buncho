import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ExpertCard from "@/components/ExpertCard";
import Avatar from "@/components/Avatar";
import { SERVICE_TYPES, SERVICE_BLURBS, inr } from "@/lib/constants";
import { BlueTick, isBlueTick } from "@/components/Badges";

export const dynamic = "force-dynamic";

const STEPS = [
  ["Say what you're stuck on", "Describe it in your own words, or filter by college, role and service. Every expert is checked by Buncho before they go live."],
  ["Pick a service and send your question", "Choose the help you need and write exactly what you want answered. The expert accepts or declines."],
  ["Leave with something to fix", "A resume with notes on it, an interview you've already practised, or a plan from someone a few steps ahead."],
];

const TRUST = [
  ["Checked before going live", "Buncho reviews every expert profile before it appears."],
  ["Full refund if declined", "If the expert can't take your request, you get your money back."],
  ["Replies are reviewed", "Every answer is read by Buncho before it reaches you."],
];

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
    <div>
      {/* Hero */}
      <section className="grid grid-cols-1 items-center gap-12 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <h1 className="rise font-display text-4xl leading-[1.08] sm:text-5xl lg:text-6xl">
            Get career advice from seniors who've already done it.
          </h1>
          <p className="rise mt-5 max-w-lg text-lg text-muted" style={{ "--i": 1 }}>
            Resume reviews, mock interviews and career guidance from people at colleges like yours. They cleared the interview, built the project or got the offer.
          </p>

          <form action="/experts" data-nav className="rise sticker mt-8 max-w-xl rounded-2xl bg-surface p-4" style={{ "--i": 2 }}>
            <label htmlFor="q" className="block text-sm font-semibold">What are you stuck on?</label>
            <textarea
              id="q"
              name="q"
              rows={2}
              placeholder="I want an AI internship but my resume isn't getting shortlisted"
              className="mt-2 w-full resize-none rounded-lg border border-line bg-surface-2 px-3 py-2.5 text-base text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="text-xs text-muted">Write it like you'd say it to a friend.</p>
              <button className="btn-primary shrink-0">Find experts</button>
            </div>
          </form>

          <p className="rise mt-5 text-sm text-muted" style={{ "--i": 3 }}>
            {expertCount} {expertCount === 1 ? "expert is" : "experts are"} live, each checked by Buncho.
          </p>
        </div>

        <aside className="rise card self-start p-5 sm:p-6" style={{ "--i": 3 }}>
          <h2 className="font-display text-xl">Recently joined</h2>
          {featured.length === 0 ? (
            <div className="py-6 text-sm text-muted">
              <p>Experts are joining now.</p>
              <Link href="/onboarding/expert" className="mt-2 inline-block font-medium text-brand hover:underline">Be one of the first</Link>
            </div>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {featured.map((e) => {
                const from = e.services.length ? Math.min(...e.services.map((s) => s.priceInr)) : null;
                return (
                  <li key={e.id}>
                    <Link href={`/experts/${e.slug}`} className="-mx-2 flex items-center gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-surface-2">
                      <Avatar name={e.user.name} src={e.user.avatarUrl} size={44} />
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-1.5 font-semibold">
                          <span className="truncate">{e.user.name}</span>
                          {isBlueTick(e) && <BlueTick className="h-4 w-4 shrink-0" />}
                        </span>
                        <span className="block truncate text-xs text-muted">{e.jobTitle} at {e.company}</span>
                        <span className="block truncate text-xs text-muted">{e.college}</span>
                      </span>
                      {from !== null && <span className="text-sm font-semibold text-brand">{inr(from)}</span>}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </aside>
      </section>

      {/* Trust */}
      <section className="mt-16 grid grid-cols-1 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
        {TRUST.map(([title, text]) => (
          <div key={title} className="bg-surface p-5">
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </div>
        ))}
      </section>

      {/* Services */}
      <section className="mt-24">
        <h2 className="max-w-xl font-display text-3xl leading-tight sm:text-4xl">What do you need help with?</h2>
        <ul className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Object.entries(SERVICE_TYPES).filter(([k]) => k !== "OTHER").map(([key, label]) => {
            const info = typeInfo.get(key);
            return (
              <li key={key}>
                <Link href={`/experts?service=${key}`} className="card card-hover flex h-full flex-col gap-2 p-6">
                  <h3 className="font-display text-xl">{label}</h3>
                  <p className="text-muted">{SERVICE_BLURBS[key]}</p>
                  <p className="mt-auto pt-3 text-sm font-semibold text-brand">
                    {info ? `from ${inr(info._min.priceInr)}` : "Coming soon"}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {featured.length > 0 && (
        <section className="mt-24">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <h2 className="font-display text-3xl leading-tight sm:text-4xl">Meet the experts</h2>
            <Link href="/experts" className="text-sm font-semibold text-brand hover:underline">See everyone</Link>
          </div>
          <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {featured.map((e) => <ExpertCard key={e.id} expert={e} />)}
          </ul>
        </section>
      )}

      {/* Steps: a real sequence, so the numbers are earned */}
      <section className="mt-24">
        <h2 className="max-w-xl font-display text-3xl leading-tight sm:text-4xl">How it works</h2>
        <ol className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="card p-6">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-soft text-sm font-bold text-brand">{i + 1}</span>
              <p className="mt-4 font-display text-lg">{title}</p>
              <p className="mt-1.5 text-sm text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* For experts */}
      <section className="mt-24 grid grid-cols-1 gap-8 rounded-2xl bg-navy p-8 text-white sm:p-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end">
        <h2 className="font-display text-3xl leading-tight sm:text-4xl">Been there? Help someone get there.</h2>
        <div>
          <p className="max-w-sm text-on-navy">Placed at a company, cleared a tough interview or built something real? Set your own prices and help students from your college.</p>
          <Link href="/onboarding/expert" className="btn-invert mt-6">Become an expert</Link>
        </div>
      </section>
    </div>
  );
}
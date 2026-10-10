import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ExpertCard from "@/components/ExpertCard";
import Avatar from "@/components/Avatar";
import { SERVICE_TYPES, SERVICE_BLURBS, inr } from "@/lib/constants";
import { BlueTick, isBlueTick } from "@/components/Badges";

export const dynamic = "force-dynamic";

const STEPS = [
  ["Say what you're stuck on", "Describe it in your own words, or filter by college, role and service. Every expert is checked by Buncho before they go live."],
  ["Pick a time that works", "Choose a service and a slot in India time. The expert confirms and shares a meeting link."],
  ["Leave with something to fix", "A resume with notes on it, an interview you've already practised, or a plan from someone a few steps ahead."],
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
      {/* Hero: the message box is the page. You write your problem, seniors answer. */}
      <section className="grid grid-cols-1 gap-12 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <h1 className="rise font-display text-5xl leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            Ask a senior who's already been through it.
          </h1>
          <p className="rise mt-6 max-w-lg text-lg text-muted" style={{ "--i": 1 }}>
            Book a short call with someone from a college like yours. They cleared the interview, built the project or got the offer, and they'll tell you what actually worked.
          </p>

          <form action="/experts" data-nav className="rise sticker mt-9 max-w-xl rounded-2xl bg-surface p-3" style={{ "--i": 2 }}>
            <label htmlFor="q" className="block px-2 pt-1 text-sm font-medium">What are you stuck on?</label>
            <textarea
              id="q"
              name="q"
              rows={2}
              placeholder="I want an AI internship but my resume isn't getting shortlisted"
              className="w-full resize-none bg-transparent px-2 py-2 text-base text-ink placeholder:text-muted/70 focus:outline-none"
            />
            <div className="flex items-center justify-between gap-3 border-t border-dashed border-line pt-3">
              <p className="px-2 text-xs text-muted">Write it like you'd say it to a friend.</p>
              <button className="btn-primary shrink-0">Find experts</button>
            </div>
          </form>

          <p className="rise mt-5 text-sm text-muted" style={{ "--i": 3 }}>
            {expertCount} {expertCount === 1 ? "expert is" : "experts are"} live, each checked by Buncho before approval.
          </p>
        </div>

        <aside className="rise self-start rounded-2xl border border-line bg-surface p-5 sm:p-6" style={{ "--i": 3 }}>
          <h2 className="font-display text-2xl">Recently joined</h2>
          {featured.length === 0 ? (
            <div className="py-6 text-sm text-muted">
              <p>Experts are joining now.</p>
              <Link href="/onboarding/expert" className="mt-2 inline-block font-medium text-brand hover:underline">Be one of the first</Link>
            </div>
          ) : (
            <ul className="mt-2 divide-y divide-line">
              {featured.map((e) => {
                const from = e.services.length ? Math.min(...e.services.map((s) => s.priceInr)) : null;
                return (
                  <li key={e.id}>
                    <Link href={`/experts/${e.slug}`} className="-mx-2 flex items-center gap-3 rounded-xl px-2 py-3 transition-colors hover:bg-surface-2">
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

      {/* Services as a plain list, not a grid of cards */}
      <section className="mt-24">
        <h2 className="max-w-xl font-display text-3xl leading-tight sm:text-4xl">What do you need help with?</h2>
        <ul className="mt-8 border-t border-line">
          {Object.entries(SERVICE_TYPES).filter(([k]) => k !== "OTHER").map(([key, label]) => {
            const info = typeInfo.get(key);
            return (
              <li key={key} className="border-b border-line">
                <Link
                  href={`/experts?service=${key}`}
                  className="-mx-3 grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 rounded-xl px-3 py-6 transition-colors hover:bg-surface sm:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)_auto]"
                >
                  <h3 className="font-display text-2xl sm:order-1">{label}</h3>
                  <p className="col-span-2 order-3 text-muted sm:order-2 sm:col-span-1">{SERVICE_BLURBS[key]}</p>
                  <p className="order-2 text-right text-sm font-medium text-brand sm:order-3">
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
            <Link href="/experts" className="text-sm font-medium text-brand hover:underline">See everyone</Link>
          </div>
          <ul className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
            {featured.map((e) => <ExpertCard key={e.id} expert={e} />)}
          </ul>
        </section>
      )}

      {/* An actual sequence, so numbers are earned here */}
      <section className="mt-24 grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
        <h2 className="font-display text-3xl leading-tight sm:text-4xl">Three steps, no back and forth.</h2>
        <ol className="relative space-y-9 pl-14">
          <span aria-hidden="true" className="absolute bottom-2 left-4 top-2 w-px bg-line" />
          {STEPS.map(([title, text], i) => (
            <li key={title} className="relative">
              <span className="absolute -left-14 top-0 flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-sm font-bold text-on-brand">{i + 1}</span>
              <p className="font-display text-xl">{title}</p>
              <p className="mt-1 max-w-md text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* For experts */}
      <section className="mt-24 grid grid-cols-1 gap-8 rounded-[28px] bg-brand p-8 text-on-brand sm:p-12 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end">
        <h2 className="font-display text-4xl leading-[1.05] sm:text-5xl">Been there? Help someone get there.</h2>
        <div>
          <p className="max-w-sm">Placed at a company, cleared a tough interview or built something real? Set your own prices and help students from your college.</p>
          <Link href="/onboarding/expert" className="btn-invert mt-6">Become an expert</Link>
        </div>
      </section>
    </div>
  );
}
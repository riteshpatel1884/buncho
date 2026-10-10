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

const ICON_PATHS = {
  RESUME_REVIEW: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  MOCK_INTERVIEW: "M4 5h16v11H9l-5 4zM8 10h8",
  CAREER_GUIDANCE: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z",
  PROJECT_REVIEW: "M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14",
};

function ServiceIcon({ type }) {
  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-soft text-brand">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={ICON_PATHS[type]} />
      </svg>
    </span>
  );
}

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
  const services = Object.entries(SERVICE_TYPES).filter(([k]) => k !== "OTHER");

  return (
    <div>
      {/* Hero */}
      <section className="relative grid grid-cols-1 items-center gap-8 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-16">
        <div aria-hidden="true" className="pointer-events-none absolute -top-16 left-1/2 h-60 w-60 -translate-x-1/2 rounded-full bg-brand/20 blur-3xl lg:hidden" />

        <div className="relative">
          <p className="rise inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-muted">
            <span className="h-2 w-2 rounded-full bg-brand" />
            {expertCount} {expertCount === 1 ? "expert is" : "experts are"} live, each checked by Buncho
          </p>
          <h1 className="rise mt-5 font-display text-[2.1rem] leading-[1.08] sm:text-5xl lg:text-6xl" style={{ "--i": 1 }}>
            Get career advice from seniors who've already done it.
          </h1>
          <p className="rise mt-4 max-w-lg text-base text-muted sm:text-lg" style={{ "--i": 2 }}>
            Resume reviews, mock interviews and career guidance from people at colleges like yours.
          </p>

          <form action="/experts" data-nav className="rise sticker mt-6 max-w-xl rounded-2xl bg-surface p-3 sm:mt-8 sm:p-4" style={{ "--i": 3 }}>
            <label htmlFor="q" className="block px-1 pb-1.5 text-sm font-semibold">What are you stuck on?</label>
            <textarea
              id="q"
              name="q"
              rows={2}
              placeholder="I want an AI internship but my resume isn't getting shortlisted"
              className="w-full resize-none rounded-xl border border-line bg-surface-2 px-3 py-2.5 text-base text-ink placeholder:text-muted/70 focus:border-brand focus:outline-none focus:ring-4 focus:ring-brand/15"
            />
            <div className="mt-3 flex items-center justify-between gap-3">
              <p className="hidden text-xs text-muted sm:block">Write it like you'd say it to a friend.</p>
              <button className="btn-primary w-full !py-3 sm:w-auto sm:!py-2.5">Find experts</button>
            </div>
          </form>

          {/* Phone only: jump straight to a service */}
          <div className="no-scrollbar -mx-4 mt-5 flex snap-x gap-2 overflow-x-auto px-4 sm:hidden">
            {services.map(([key, label]) => (
              <Link key={key} href={`/experts?service=${key}`} className="shrink-0 snap-start rounded-full border border-line bg-surface px-4 py-2 text-sm font-medium">
                {label}
              </Link>
            ))}
          </div>
        </div>

        <aside className="rise card hidden self-start p-6 lg:block" style={{ "--i": 3 }}>
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

      {/* Trust: swipeable on phones, a joined strip on larger screens */}
      <section className="no-scrollbar -mx-4 mt-10 flex snap-x gap-3 overflow-x-auto px-4 sm:mx-0 sm:mt-16 sm:grid sm:snap-none sm:grid-cols-3 sm:gap-px sm:overflow-hidden sm:rounded-xl sm:border sm:border-line sm:bg-line sm:px-0">
        {TRUST.map(([title, text]) => (
          <div key={title} className="w-64 shrink-0 snap-start rounded-xl border border-line bg-surface p-4 sm:w-auto sm:rounded-none sm:border-0 sm:p-5">
            <p className="font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </div>
        ))}
      </section>

      {/* Services: 2-up tiles on phones, a roomier grid on larger screens */}
      <section className="mt-14 md:mt-24">
        <h2 className="font-display text-2xl leading-tight sm:text-4xl">What do you need help with?</h2>
        <ul className="mt-5 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4">
          {services.map(([key, label]) => {
            const info = typeInfo.get(key);
            return (
              <li key={key}>
                <Link href={`/experts?service=${key}`} className="card card-hover flex h-full flex-col gap-2 p-4 sm:p-6">
                  <ServiceIcon type={key} />
                  <h3 className="mt-1 font-display text-base leading-snug sm:text-xl">{label}</h3>
                  <p className="line-clamp-2 text-xs text-muted sm:text-base">{SERVICE_BLURBS[key]}</p>
                  <p className="mt-auto pt-2 text-sm font-semibold text-brand">{info ? `from ${inr(info._min.priceInr)}` : "Coming soon"}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {featured.length > 0 && (
        <section className="mt-14 md:mt-24">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="font-display text-2xl leading-tight sm:text-4xl">Meet the experts</h2>
            <Link href="/experts" className="shrink-0 text-sm font-semibold text-brand hover:underline">See all</Link>
          </div>
          {/* Swipe sideways on phones */}
          <ul className="no-scrollbar -mx-4 mt-5 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:mt-8 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 md:grid-cols-3 [&>li]:w-[82%] [&>li]:shrink-0 [&>li]:snap-start sm:[&>li]:w-auto">
            {featured.map((e) => <ExpertCard key={e.id} expert={e} />)}
          </ul>
        </section>
      )}

      {/* Steps: a timeline on phones, three cards on larger screens */}
      <section className="mt-14 md:mt-24">
        <h2 className="font-display text-2xl leading-tight sm:text-4xl">How it works</h2>
        <ol className="relative mt-6 space-y-7 pl-12 md:hidden">
          <span aria-hidden="true" className="absolute bottom-3 left-[15px] top-3 w-px bg-line" />
          {STEPS.map(([title, text], i) => (
            <li key={title} className="relative">
              <span className="absolute -left-12 top-0 flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-on-brand">{i + 1}</span>
              <p className="font-display text-lg">{title}</p>
              <p className="mt-1 text-sm text-muted">{text}</p>
            </li>
          ))}
        </ol>
        <ol className="mt-8 hidden grid-cols-3 gap-4 md:grid">
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
      {/* <section className="mt-14 grid grid-cols-1 gap-6 rounded-3xl bg-navy p-6 text-white sm:p-12 md:mt-24 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:items-end">
        <h2 className="font-display text-2xl leading-tight sm:text-4xl">Been there? Help someone get there.</h2>
        <div>
          <p className="max-w-sm text-sm text-on-navy sm:text-base">Placed at a company, cleared a tough interview or built something real? Set your own prices and help students from your college.</p>
          <Link href="/onboarding/expert" className="btn-invert mt-5 w-full sm:w-auto">Add Services</Link>
        </div>
      </section> */}
    </div>
  );
}
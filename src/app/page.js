import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";
import { getPosts } from "@/lib/feed/feedQueries";
import { TOPICS, timeAgo } from "@/lib/feed/feed";
import { budgetLabel, days } from "@/lib/projects";
import ExpertCard from "@/components/ExpertCard";
import Avatar from "@/components/Avatar";
import { SERVICE_TYPES, SERVICE_BLURBS, inr } from "@/lib/constants";
import { BlueTick, OfficialTick, isBlueTick } from "@/components/Badges";

export const dynamic = "force-dynamic";

const SERVICE_ICON = {
  RESUME_REVIEW: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  MOCK_INTERVIEW: "M4 5h16v11H9l-5 4zM8 10h8",
  CAREER_GUIDANCE: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z",
  PROJECT_REVIEW: "M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14",
};

const TOPIC_ICON = {
  CAREER: "M3 8h18v12H3zM8 8V5h8v3M3 13h18",
  PLACEMENTS: "M5 21V4M5 4h12l-2 4 2 4H5",
  RESEARCH: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  TECHNOLOGY: "M8 8l-5 4 5 4M16 8l5 4-5 4M14 5l-4 14",
};

const STEPS = [
  ["Set up your profile", "Tell people what you build, your college and the role you are aiming for."],
  ["Share what you're learning", "Post a lesson, a build or a question in the feed. Others reply, like and save."],
  ["Find people to build with", "Open a collab, or send a proposal on a project someone else published."],
  ["Get unstuck with an expert", "Book a resume review, a mock interview or a project review from someone who has done it."],
];

function Svg({ d, size = 20, sw = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function SectionHead({ title, text, href, cta }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        <h2 className="font-display text-2xl leading-tight sm:text-3xl">{title}</h2>
        {text && <p className="mt-1 max-w-xl text-sm text-muted sm:text-base">{text}</p>}
      </div>
      {href && <Link href={href} className="shrink-0 text-sm font-semibold text-brand hover:underline">{cta}</Link>}
    </div>
  );
}

function Empty({ title, text, href, cta }) {
  return (
    <div className="rounded-2xl border border-dashed border-line p-8 text-center">
      <p className="font-display text-lg">{title}</p>
      <p className="mx-auto mt-1 max-w-sm text-sm text-muted">{text}</p>
      <Link href={href} className="btn-primary mt-4 !rounded-full">{cta}</Link>
    </div>
  );
}

function authorLine(a) {
  if (a.isAdmin) return "Buncho team";
  if (a.jobTitle && a.company) return `${a.jobTitle} at ${a.company}`;
  if (a.role === "STUDENT") return a.college ? `Student, ${a.college}` : "Student";
  return a.college || "Expert";
}

// One row inside the hero's feed window. The whole row opens the post.
function PreviewPost({ p, i }) {
  return (
    <li className="rise" style={{ "--i": i + 1 }}>
      <Link href={`/feed/${p.id}`} className="block px-5 py-4 transition-colors hover:bg-surface-2/70">
        <div className="flex items-center gap-3">
          <Avatar name={p.author.name} src={p.author.avatarUrl} color={p.author.avatarColor} icon={p.author.avatarIcon} admin={p.author.isAdmin} size={38} />
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 text-sm font-semibold">
              <span className="truncate">{p.author.name || "Someone"}</span>
              {p.author.isAdmin && <OfficialTick className="h-4 w-4 shrink-0" />}
              {p.author.blueTick && <BlueTick className="h-4 w-4 shrink-0" />}
            </p>
            <p className="truncate text-xs text-muted">{authorLine(p.author)} · {timeAgo(p.createdAt)}</p>
          </div>
          {p.topic && <span className="shrink-0 text-xs font-semibold text-brand">#{TOPICS[p.topic] ?? p.topic}</span>}
        </div>
        <p className="mt-2.5 line-clamp-3 whitespace-pre-line break-words text-sm leading-6">{p.body}</p>
        <p className="mt-2.5 flex items-center gap-4 text-xs text-muted">
          <span className="inline-flex items-center gap-1.5"><Svg d="M12 21s-7.5-4.6-9.5-9.2C1 8.4 3 5 6.4 5c2 0 3.6 1 4.6 2.6C12 6 13.6 5 15.6 5 19 5 21 8.4 19.5 11.8 19.5 11.8 12 21 12 21z" size={14} />{p.likes}</span>
          <span className="inline-flex items-center gap-1.5"><Svg d="M4 5h16v11H9l-5 4z" size={14} />{p.comments}</span>
        </p>
      </Link>
    </li>
  );
}

export default async function Home() {
  const [me, featured, expertCount, projects, openProjects, feed, postCount, memberCount, byType, topicCounts] = await Promise.all([
    getDbUser().catch(() => null),
    prisma.expertProfile.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: 6,
      include: {
        user: { select: { name: true, avatarUrl: true, avatarColor: true, avatarIcon: true } },
        services: { where: { active: true }, select: { type: true, title: true, priceInr: true } },
      },
    }),
    prisma.expertProfile.count({ where: { status: "ACTIVE" } }),
    prisma.project.findMany({
      where: { status: "OPEN" },
      orderBy: { createdAt: "desc" },
      take: 4,
      include: { student: { select: { name: true } } },
    }),
    prisma.project.count({ where: { status: "OPEN" } }),
    getPosts({}).then((r) => r.posts.slice(0, 3)).catch(() => []),
    prisma.post.count({ where: { hidden: false } }),
    prisma.user.count({ where: { role: { not: null } } }),
    prisma.service.groupBy({
      by: ["type"],
      where: { active: true, expert: { status: "ACTIVE" } },
      _min: { priceInr: true },
    }),
    prisma.post.groupBy({ by: ["topic"], where: { hidden: false, topic: { not: null } }, _count: { _all: true } }).catch(() => []),
  ]);
  // Does the signed-in person already have an active blue tick? Experts keep it on their expert profile, everyone else on the account.
  const tickUntil =
    me?.role === "EXPERT"
      ? (await prisma.expertProfile.findUnique({ where: { userId: me.id }, select: { blueTickUntil: true } }).catch(() => null))?.blueTickUntil
      : me?.blueTickUntil;
  const hasTick = !!me && isBlueTick({ blueTickUntil: tickUntil });

  const typeInfo = new Map(byType.map((t) => [t.type, t]));
  const topicInfo = new Map(topicCounts.map((t) => [t.topic, t._count._all]));
  const services = Object.entries(SERVICE_TYPES).filter(([k]) => k !== "OTHER");

  // Calls to action depend on who is looking.
  const primary = me ? { href: "/feed", label: "Open the feed" } : { href: "/sign-up", label: "Join Buncho" };
  const secondary = !me
    ? { href: "/feed", label: "Browse the feed" }
    : me.role === "STUDENT"
      ? { href: "/projects/new", label: "Post a project" }
      : me.role === "EXPERT"
        ? { href: "/projects", label: "Browse projects" }
        : { href: "/onboarding", label: "Finish setup" };

  return (
    <div className="space-y-16 md:space-y-24">
      {/* Hero: the feed itself is the picture */}
      <section className="grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <h1 className="font-display text-[2.4rem] leading-[1.04] sm:text-5xl lg:text-[3.6rem]">
            Share what you build. Find who to build it with.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted sm:text-lg">
            Post what you're learning, team up on projects, and get honest reviews from seniors who have already done it.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={primary.href} className="btn-primary !rounded-full !px-6 !py-3">{primary.label}</Link>
            <Link href={secondary.href} className="btn-outline !rounded-full !px-6 !py-3">{secondary.label}</Link>
          </div>
          <p className="mt-6 text-sm text-muted">
            <b className="text-ink">{memberCount}</b> builders, <b className="text-ink">{expertCount}</b> checked experts and <b className="text-ink">{openProjects}</b> open collabs on Buncho right now.
          </p>
        </div>

        <div className="relative isolate">
          <div aria-hidden="true" className="absolute inset-x-5 -bottom-4 top-5 -z-10 rotate-[2.5deg] rounded-[2rem] bg-brand-soft" />
          <div className="overflow-hidden rounded-3xl border border-line bg-surface shadow-[0_28px_60px_-24px_rgba(11,27,51,0.3)]">
            <div className="flex items-center justify-between border-b border-line px-5 py-3.5">
              <p className="font-display text-base">Buncho Feed</p>
              <Link href="/feed" className="text-sm font-semibold text-brand hover:underline">Open feed</Link>
            </div>
            {feed.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <p className="font-display text-lg">Nothing posted yet</p>
                <p className="mx-auto mt-1 max-w-xs text-sm text-muted">Share the first lesson or build and it shows up here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {feed.map((p, i) => <PreviewPost key={p.id} p={p} i={i} />)}
              </ul>
            )}
            <Link href="/feed" className="block border-t border-line bg-surface-2 px-5 py-3 text-center text-sm font-semibold text-brand transition-colors hover:underline">
              {postCount > 3 ? `Read all ${postCount} posts` : "Go to the feed"}
            </Link>
          </div>
        </div>
      </section>

      {/* Topics */}
      <section className="space-y-5">
        <SectionHead title="Pick a topic" text="Jump straight into what you want to read." href="/feed" cta="Open the feed" />
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {Object.entries(TOPICS).map(([k, label]) => {
            const n = topicInfo.get(k) ?? 0;
            return (
              <li key={k}>
                <Link href={`/feed?topic=${k}`} className="card card-hover flex h-full items-center gap-3 p-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-soft text-brand">
                    <Svg d={TOPIC_ICON[k] ?? TOPIC_ICON.TECHNOLOGY} />
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate font-display text-base">{label}</span>
                    <span className="block text-xs text-muted">{n} {n === 1 ? "post" : "posts"}</span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Collab */}
      <section className="space-y-5">
        <SectionHead title="Collab" text="Projects published by students. Send a proposal, or ask a question first." href="/projects" cta="See all projects" />
        {projects.length === 0 ? (
          <Empty title="No open projects yet" text="Be the first to publish a project and get proposals from experts." href={me ? "/projects/new" : "/sign-up"} cta={me ? "Post a project" : "Join to post one"} />
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {projects.map((p) => (
              <li key={p.id}>
                <Link href={`/projects/${p.id}`} className="card card-hover flex h-full flex-col gap-3 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="chip">{SERVICE_TYPES[p.helpType]}</span>
                    <span className="font-display text-lg">{budgetLabel(p)}</span>
                  </div>
                  <h3 className="font-display text-lg leading-snug">{p.title}</h3>
                  <p className="line-clamp-2 text-sm text-muted">{p.description}</p>
                  <div className="mt-auto flex items-center gap-2.5 border-t border-line pt-3">
                    <Avatar name={p.student.name} size={28} />
                    <p className="min-w-0 flex-1 truncate text-xs text-muted">
                      <span className="font-medium text-ink">{p.student.name || "A student"}</span> · {days(p.deadlineDays)} · {timeAgo(p.createdAt.toISOString())}
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Experts */}
      <section className="space-y-5">
        <SectionHead title="Experts" text="Seniors and working professionals, each checked by Buncho before they go live." href="/experts" cta="Find an expert" />
        {featured.length === 0 ? (
          <Empty title="Experts are joining now" text="Placed somewhere or built something real? Help the people coming up behind you." href="/onboarding/expert" cta="Become an expert" />
        ) : (
          <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-3 [&>li]:w-[82%] [&>li]:shrink-0 [&>li]:snap-start sm:[&>li]:w-auto">
            {featured.map((e) => <ExpertCard key={e.id} expert={e} />)}
          </ul>
        )}
      </section>

      {/* Expert help by service */}
      <section className="space-y-5">
        <SectionHead title="Get expert help" text="Written answers from people who have been where you are." />
        <ul className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {services.map(([key, label]) => {
            const info = typeInfo.get(key);
            return (
              <li key={key}>
                <Link href={`/experts?service=${key}`} className="card card-hover flex h-full flex-col gap-2 p-4 sm:p-5">
                  <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-brand-soft text-brand"><Svg d={SERVICE_ICON[key]} /></span>
                  <h3 className="mt-1 font-display text-base leading-snug sm:text-lg">{label}</h3>
                  <p className="line-clamp-2 text-xs text-muted sm:text-sm">{SERVICE_BLURBS[key]}</p>
                  <p className="mt-auto pt-2 text-sm font-semibold text-brand">{info ? `from ${inr(info._min.priceInr)}` : "Coming soon"}</p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* How it works: a real sequence, so the steps are numbered */}
      <section className="space-y-5">
        <SectionHead title="How Buncho works" />
        <ol className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(([title, text], i) => (
            <li key={title} className="card p-5">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-sm font-bold text-on-brand">{i + 1}</span>
              <p className="mt-3 font-display text-lg leading-snug">{title}</p>
              <p className="mt-1.5 text-sm text-muted">{text}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* Join / blue tick */}
      <section
        className="grid grid-cols-1 gap-6 rounded-3xl bg-navy p-6 text-white sm:p-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-end"
        style={{ backgroundImage: "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--on-navy) 18%, transparent) 1px, transparent 0)", backgroundSize: "20px 20px" }}
      >
        <div>
          <h2 className="font-display text-2xl leading-tight sm:text-4xl">
            {me ? "Stand out with a blue tick." : "Your next project starts with one post."}
          </h2>
          <p className="mt-3 max-w-md text-sm text-on-navy sm:text-base">
            {me
              ? <>The blue tick shows next to your name on every post and comment. <span className="inline-flex align-middle"><BlueTick className="h-4 w-4" /></span> ₹99 per month, cancel any time.</>
              : "Create a free account, introduce yourself in the feed, and see who wants to build with you."}
          </p>
        </div>
        <div className="flex flex-wrap gap-3 lg:justify-end">
          {me ? (
            <>
              {!hasTick && <Link href="/dashboard/verification" className="btn-invert !rounded-full">Get the blue tick</Link>}
              <Link href="/feed" className="btn-invert !rounded-full">Write a post</Link>
            </>
          ) : (
            <>
              <Link href="/sign-up" className="btn-invert !rounded-full">Join Buncho</Link>
              <Link href="/sign-in" className="btn-invert !rounded-full">Sign in</Link>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
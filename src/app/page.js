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
  ["Set up your profile", "Tell people what you build, your college and the role you are aiming for.", "#ff6a00", "M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"],
  ["Share what you're learning", "Post a lesson, a build or a question in the feed. Others reply, like and save.", "#16a34a", "M4 5h16v11H9l-5 4zM8 9h8M8 12h5"],
  ["Find people to build with", "Open a collab, or send a proposal on a project someone else published.", "#06b6d4", "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"],
  ["Get unstuck with an expert", "Book a resume review, a mock interview or a project review from someone who has done it.", "#7c3aed", "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.2 13.9L7 22l5-3 5 3-1.2-8.1"],
];

// One accent colour and one line of copy per feed topic. Unknown topics fall back to teal.
const TOPIC_META = {
  CAREER: ["#2f6bff", "Roles, switches and what to do next."],
  PLACEMENTS: ["#f97316", "Prep, interviews and the offers that worked."],
  RESEARCH: ["#7c3aed", "Papers, labs and how to get started."],
  TECHNOLOGY: ["#16a34a", "Builds, stacks and things worth learning."],
};
const TOPIC_FALLBACK = ["#0891b2", "Posts from people building in this area."];

const SERVICE_TONE = {
  RESUME_REVIEW: "#2f6bff",
  MOCK_INTERVIEW: "#f97316",
  CAREER_GUIDANCE: "#16a34a",
  PROJECT_REVIEW: "#7c3aed",
};
const PROJECT_TONES = ["#2f6bff", "#f97316", "#16a34a", "#7c3aed"];

function Svg({ d, size = 20, sw = 2 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

// Small orange label with a line on each side, like "SPECIAL ATTRACTIONS".
function Eyebrow({ children, center = true }) {
  return (
    <p className={`flex items-center gap-3 text-xs font-bold uppercase tracking-[0.28em] text-[#f26a1b] ${center ? "justify-center" : ""}`}>
      {center && <span aria-hidden="true" className="h-px w-8 bg-current opacity-60 sm:w-14" />}
      {children}
      <span aria-hidden="true" className="h-px w-8 bg-current opacity-60 sm:w-14" />
    </p>
  );
}

// Centred heading with a gradient word. Used for the big sections.
function CenterHead({ eyebrow, title, accent, text }) {
  return (
    <div className="text-center">
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 className="mt-3 font-display text-3xl leading-[1.1] sm:text-5xl">
        {title} {accent}
      </h2>
      {text && <p className="mx-auto mt-3 max-w-xl text-sm text-muted sm:text-base">{text}</p>}
    </div>
  );
}

function SectionHead({ eyebrow, title, text, href, cta }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="min-w-0">
        {eyebrow && <Eyebrow center={false}>{eyebrow}</Eyebrow>}
        <h2 className="mt-2 font-display text-2xl leading-tight sm:text-4xl">{title}</h2>
        {text && <p className="mt-1.5 max-w-xl text-sm text-muted sm:text-base">{text}</p>}
      </div>
      {href && <Link href={href} className="shrink-0 text-sm font-semibold text-brand hover:underline">{cta}</Link>}
    </div>
  );
}

// ---------- Hub: a centre card with cards on both sides, joined by curved lines (desktop only) ----------
// items: [{ key, color, node }]. On a phone the centre card comes first and the cards stack below it.
function Rail({ items, side }) {
  const n = items.length;
  if (!n) return <div />;
  const ys = items.map((_, i) => ((i + 0.5) / n) * 100); // where each card is
  const ts = items.map((_, i) => 50 + (i - (n - 1) / 2) * 9); // where each line lands on the centre card
  return (
    <div aria-hidden="true" className="relative">
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 h-full w-full overflow-visible">
        {items.map((it, i) => (
          <path
            key={it.key}
            d={side === "left" ? `M0 ${ys[i]} C60 ${ys[i]} 40 ${ts[i]} 100 ${ts[i]}` : `M0 ${ts[i]} C60 ${ts[i]} 40 ${ys[i]} 100 ${ys[i]}`}
            fill="none"
            stroke={it.color}
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        ))}
      </svg>
      {items.map((it, i) => (
        <span key={it.key}>
          <span className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-2.5 sm:w-2.5" style={{ left: side === "left" ? "0%" : "100%", top: `${ys[i]}%`, background: it.color }} />
          <span className="absolute h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full sm:h-2.5 sm:w-2.5" style={{ left: side === "left" ? "100%" : "0%", top: `${ts[i]}%`, background: it.color }} />
        </span>
      ))}
    </div>
  );
}

function HubSide({ items }) {
  return (
    <div className="flex flex-col gap-2 sm:gap-3 lg:gap-4 [&>*]:flex-1">
      {items.map((it) => (
        <div key={it.key} className="flex">{it.node}</div>
      ))}
    </div>
  );
}

// Same layout on every screen: cards on the left, one card in the centre, cards on the right.
// Only the sizes change, and on small screens the cards show less text.
function Hub({ center, left, right }) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_0.75rem_minmax(0,1.15fr)_0.75rem_minmax(0,1fr)] sm:grid-cols-[minmax(0,1fr)_2.5rem_minmax(0,16rem)_2.5rem_minmax(0,1fr)] lg:grid-cols-[minmax(0,1fr)_4.5rem_minmax(0,22rem)_4.5rem_minmax(0,1fr)]">
      <HubSide items={left} />
      <Rail items={left} side="left" />
      <div className="self-center">{center}</div>
      <Rail items={right} side="right" />
      <HubSide items={right} />
    </div>
  );
}

// On a phone these cards show only the icon and title (plus the count or price). The description, number and arrow appear on a laptop.
function TopicCard({ href, icon, label, blurb, count, color }) {
  return (
    <Link href={href} className="tone-card flex w-full flex-col items-start gap-1.5 p-2 sm:gap-2.5 sm:p-4 lg:flex-row lg:items-center lg:gap-4 lg:p-5" style={{ "--tone": color }}>
      <span className="tone-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-full sm:h-11 sm:w-11 lg:h-14 lg:w-14 [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-[22px] sm:[&>svg]:w-[22px]"><Svg d={icon} size={22} /></span>
      <span className="min-w-0">
        <span className="block font-display text-xs leading-tight sm:text-[15px] lg:text-lg lg:leading-snug">{label}</span>
        <span className="mt-0.5 hidden text-sm leading-5 text-muted lg:block">{blurb}</span>
        <span className="mt-0.5 block text-[10px] text-muted sm:text-xs lg:mt-1.5 lg:text-sm">{count} {count === 1 ? "post" : "posts"}</span>
      </span>
    </Link>
  );
}

function ServiceCard({ href, icon, label, blurb, price, n, color }) {
  return (
    <Link href={href} className="tone-card relative flex w-full flex-col items-start gap-1.5 p-2 sm:gap-2.5 sm:p-4 lg:flex-row lg:items-center lg:gap-4 lg:p-5 lg:pb-5" style={{ "--tone": color }}>
      <span className="absolute right-4 top-3 hidden font-display text-3xl leading-none text-muted opacity-40 lg:block">0{n}</span>
      <span className="tone-icon flex h-8 w-8 shrink-0 items-center justify-center rounded-xl sm:h-11 sm:w-11 sm:rounded-2xl lg:h-14 lg:w-14 [&>svg]:h-4 [&>svg]:w-4 sm:[&>svg]:h-[22px] sm:[&>svg]:w-[22px]"><Svg d={icon} size={22} /></span>
      <span className="min-w-0 lg:flex-1 lg:pr-11">
        <span className="block font-display text-xs leading-tight sm:text-[15px] lg:text-lg lg:leading-snug">{label}</span>
        <span className="mt-0.5 hidden text-sm leading-5 text-muted lg:line-clamp-2 lg:block">{blurb}</span>
        <span className="mt-0.5 block text-[10px] text-muted sm:text-xs lg:mt-1.5 lg:text-sm">{price}</span>
      </span>
      <span className="absolute bottom-3.5 right-4 hidden h-8 w-8 items-center justify-center rounded-full text-white lg:flex" style={{ background: "var(--tone)" }}>
        <Svg d="M5 12h14M13 6l6 6-6 6" size={15} />
      </span>
    </Link>
  );
}

// ---------- Timeline: coloured line with numbered stops (desktop), coloured rail (mobile) ----------
function StepCircle({ color, icon, size = "h-24 w-24 border-[9px]", iconSize = 38 }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center rounded-full bg-surface text-ink ${size}`}
      style={{ borderStyle: "solid", borderColor: color, boxShadow: `0 18px 34px -14px ${color}` }}
    >
      <Svg d={icon} size={iconSize} />
    </span>
  );
}

function StepStem({ color, icon, n, up }) {
  return (
    <div className="relative flex flex-col items-center">
      {up && <StepCircle color={color} icon={icon} />}
      <span aria-hidden="true" className="h-14 w-2 rounded-full" style={{ background: color }} />
      {!up && <StepCircle color={color} icon={icon} />}
      <span aria-hidden="true" className={`absolute left-1/2 ml-6 font-display text-5xl leading-none ${up ? "bottom-2" : "top-2"}`} style={{ color }}>0{n}</span>
    </div>
  );
}

function StepText({ n, title, text, color }) {
  return (
    <div className="px-5 text-center">
      <p className="font-display text-lg uppercase leading-tight">
        <span style={{ color }}>0{n}</span> {title}
      </p>
      <p className="mt-2 text-sm leading-6 text-muted">{text}</p>
    </div>
  );
}

function Timeline() {
  return (
    <>
      {/* Desktop: one grid so the line stays straight; steps alternate above and below it */}
      <div className="mx-auto hidden max-w-6xl grid-cols-4 grid-rows-[auto_0.875rem_auto] lg:grid">
        {STEPS.flatMap(([title, text, color, icon], i) => {
          const textAbove = i % 2 === 0;
          const n = i + 1;
          return [
            <div key={`top${i}`} style={{ gridColumn: n, gridRow: 1 }} className="flex min-h-[14rem] flex-col items-center justify-end">
              {textAbove ? <div className="pb-8"><StepText n={n} title={title} text={text} color={color} /></div> : <StepStem color={color} icon={icon} n={n} up />}
            </div>,
            <div key={`line${i}`} style={{ gridColumn: n, gridRow: 2, background: color }} className="relative">
              <span className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[4px] bg-surface" style={{ borderColor: color }} />
            </div>,
            <div key={`bottom${i}`} style={{ gridColumn: n, gridRow: 3 }} className="flex min-h-[14rem] flex-col items-center justify-start">
              {textAbove ? <StepStem color={color} icon={icon} n={n} up={false} /> : <div className="pt-8"><StepText n={n} title={title} text={text} color={color} /></div>}
            </div>,
          ];
        })}
      </div>

      {/* Mobile: a coloured rail down the left */}
      <ol className="relative mx-auto max-w-md space-y-8 lg:hidden">
        <span
          aria-hidden="true"
          className="absolute bottom-8 left-[1.8rem] top-8 w-1.5 rounded-full"
          style={{ background: `linear-gradient(to bottom, ${STEPS.map((s) => s[2]).join(", ")})` }}
        />
        {STEPS.map(([title, text, color, icon], i) => (
          <li key={title} className="relative flex gap-4">
            <span className="relative z-10">
              <StepCircle color={color} icon={icon} size="h-16 w-16 border-[6px]" iconSize={24} />
            </span>
            <div className="min-w-0 pt-1">
              <p className="font-display text-lg uppercase leading-tight">
                <span style={{ color }}>0{i + 1}</span> {title}
              </p>
              <p className="mt-1.5 text-sm leading-6 text-muted">{text}</p>
            </div>
          </li>
        ))}
      </ol>
    </>
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

  // Cards for the two "hub" sections.
  const topicItems = Object.entries(TOPICS).map(([k, label]) => {
    const [color, blurb] = TOPIC_META[k] ?? TOPIC_FALLBACK;
    return {
      key: k,
      color,
      node: <TopicCard href={`/feed?topic=${k}`} color={color} icon={TOPIC_ICON[k] ?? TOPIC_ICON.TECHNOLOGY} label={label} blurb={blurb} count={topicInfo.get(k) ?? 0} />,
    };
  });
  const serviceItems = services.map(([key, label], i) => {
    const color = SERVICE_TONE[key] ?? "#0891b2";
    const info = typeInfo.get(key);
    return {
      key,
      color,
      node: <ServiceCard href={`/experts?service=${key}`} color={color} icon={SERVICE_ICON[key]} label={label} blurb={SERVICE_BLURBS[key]} price={info ? `from ${inr(info._min.priceInr)}` : "Coming soon"} n={i + 1} />,
    };
  });
  const split = (list) => [list.slice(0, Math.ceil(list.length / 2)), list.slice(Math.ceil(list.length / 2))];
  const [topicsLeft, topicsRight] = split(topicItems);
  const [servicesLeft, servicesRight] = split(serviceItems);

  const heroStats = [
    [memberCount, "builders", "#2f6bff"],
    [expertCount, "checked experts", "#16a34a"],
    [openProjects, "open collabs", "#f97316"],
  ];

  return (
    <div className="space-y-20 md:space-y-28">
      {/* Hero: the feed itself is the picture */}
      <section className="relative isolate grid grid-cols-1 items-center gap-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-16">
        <div>
          <Eyebrow center={false}>Students and experts</Eyebrow>
          <h1 className="mt-4 font-display text-[2.4rem] leading-[1.04] sm:text-5xl lg:text-[3.6rem]">
            Share what you build. Find who to build it with.
          </h1>
          <p className="mt-5 max-w-lg text-base leading-7 text-muted sm:text-lg">
            Post what you're learning, team up on projects, and get honest reviews from seniors who have already done it.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link href={primary.href} className="btn-primary !rounded-full !px-6 !py-3">{primary.label}</Link>
            <Link href={secondary.href} className="btn-outline !rounded-full !px-6 !py-3">{secondary.label}</Link>
          </div>
          <ul className="mt-8 grid max-w-md grid-cols-3 gap-2.5 sm:gap-3">
            {heroStats.map(([n, label, color]) => (
              <li key={label} className="tone-card px-2 py-3 text-center sm:px-3" style={{ "--tone": color }}>
                <p className="font-display text-2xl leading-none sm:text-3xl" style={{ color }}>{n}</p>
                <p className="mt-1.5 text-[11px] leading-tight text-muted sm:text-xs">{label}</p>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative isolate">
          <div aria-hidden="true" className="dot-grid absolute -right-4 -top-6 -z-10 hidden h-24 w-24 sm:block" />
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

      {/* Topics: centre card with a card for each topic */}
      <section className="space-y-8">
        <CenterHead eyebrow="Feed topics" title="Find your" accent="focus" text="Jump straight into what you want to read." />
        <Hub
          left={topicsLeft}
          right={topicsRight}
          center={
            <div className="rounded-2xl border border-line bg-surface px-2 py-4 text-center shadow-[0_24px_50px_-28px_rgba(11,27,51,0.35)] sm:rounded-3xl sm:px-6 sm:py-8 lg:py-10">
              <p className="whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.08em] text-[#f26a1b] sm:text-xs sm:tracking-[0.3em]">Buncho feed</p>
              <p className="mt-2 whitespace-nowrap font-display text-xl uppercase leading-[0.95] sm:mt-3 sm:text-4xl lg:text-5xl">Pick a</p>
              <p className="whitespace-nowrap font-display text-xl uppercase leading-[1.05] sm:text-4xl lg:text-5xl">topic</p>
              <p className="mx-auto mt-4 hidden max-w-[15rem] text-sm text-muted sm:block">Read what people are sharing, then join the conversation.</p>
              <Link href="/feed" className="btn-primary mt-4 !rounded-full whitespace-nowrap !px-2.5 !py-1.5 !text-[11px] sm:mt-5 sm:!px-5 sm:!py-2.5 sm:!text-sm">
                <span className="sm:hidden">Open feed</span>
                <span className="hidden sm:inline">Open the feed</span>
              </Link>
            </div>
          }
        />
      </section>

      {/* Collab */}
      <section className="space-y-6">
        <SectionHead eyebrow="Collab" title="Build something together" text="Projects published by students. Send a proposal, or ask a question first." href="/projects" cta="See all projects" />
        {projects.length === 0 ? (
          <Empty title="No open projects yet" text="Be the first to publish a project and get proposals from experts." href={me ? "/projects/new" : "/sign-up"} cta={me ? "Post a project" : "Join to post one"} />
        ) : (
          <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {projects.map((p, i) => {
              const color = PROJECT_TONES[i % PROJECT_TONES.length];
              return (
                <li key={p.id}>
                  <Link href={`/projects/${p.id}`} className="tone-card flex h-full flex-col gap-3 p-5" style={{ "--tone": color }}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold" style={{ color }}>{SERVICE_TYPES[p.helpType]}</span>
                      <span className="font-display text-lg">{budgetLabel(p)}</span>
                    </div>
                    <h3 className="font-display text-lg leading-snug">{p.title}</h3>
                    <p className="line-clamp-2 text-sm text-muted">{p.description}</p>
                    <div className="mt-auto flex items-center gap-2.5 border-t pt-3" style={{ borderColor: "var(--tone-bd)" }}>
                      <Avatar name={p.student.name} size={28} />
                      <p className="min-w-0 flex-1 truncate text-xs text-muted">
                        <span className="font-medium text-ink">{p.student.name || "A student"}</span> · {days(p.deadlineDays)} · {timeAgo(p.createdAt.toISOString())}
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {/* Experts */}
      <section className="space-y-6">
        <SectionHead eyebrow="Experts" title="Learn from people who did it" text="Seniors and working professionals, each checked by Buncho before they go live." href="/experts" cta="Find an expert" />
        {featured.length === 0 ? (
          <Empty title="Experts are joining now" text="Placed somewhere or built something real? Help the people coming up behind you." href="/onboarding/expert" cta="Become an expert" />
        ) : (
          <ul className="no-scrollbar -mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:gap-4 sm:overflow-visible sm:px-0 lg:grid-cols-3 [&>li]:w-[82%] [&>li]:shrink-0 [&>li]:snap-start sm:[&>li]:w-auto">
            {featured.map((e) => <ExpertCard key={e.id} expert={e} />)}
          </ul>
        )}
      </section>

      {/* Expert help by service: numbered cards around a centre card */}
      <section className="space-y-8">
        <CenterHead eyebrow="Expert help" title="More than a" accent="feed" text="Written answers from people who have been where you are." />
        <Hub
          left={servicesLeft}
          right={servicesRight}
          center={
            <div
              className="rounded-2xl border border-line px-2 py-4 text-center shadow-[0_24px_50px_-28px_rgba(11,27,51,0.35)] sm:rounded-3xl sm:px-6 sm:py-8 lg:py-10"
              style={{ background: "linear-gradient(180deg, color-mix(in srgb, #fb923c 14%, var(--surface)), var(--surface) 70%)" }}
            >
              <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full text-white shadow-lg sm:h-20 sm:w-20 [&>svg]:h-5 [&>svg]:w-5 sm:[&>svg]:h-9 sm:[&>svg]:w-9" style={{ background: "linear-gradient(135deg, #fb923c, #e11d8f)" }}>
                <Svg d="M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.2 13.9L7 22l5-3 5 3-1.2-8.1" size={38} />
              </span>
              <p className="mt-3 whitespace-nowrap text-[8px] font-bold uppercase tracking-[0.08em] text-[#f26a1b] sm:mt-4 sm:text-xs sm:tracking-[0.3em]">Get unstuck</p>
              <p className="mt-1 font-display text-base leading-tight sm:text-3xl lg:text-4xl">Ask an expert</p>
              <p className="mx-auto mt-3 hidden max-w-[15rem] text-sm text-muted sm:block">Resume, interviews, career and projects, reviewed by someone who has done it.</p>
              <Link href="/experts" className="btn-primary mt-4 !rounded-full whitespace-nowrap !px-2.5 !py-1.5 !text-[11px] sm:mt-5 sm:!px-5 sm:!py-2.5 sm:!text-sm">
                <span className="sm:hidden">Find experts</span>
                <span className="hidden sm:inline">Find an expert</span>
              </Link>
            </div>
          }
        />
      </section>

      {/* How it works: a real sequence, so the steps are numbered */}
      <section className="space-y-10 md:space-y-12">
        <CenterHead eyebrow="How it works" title="Four steps to" accent="getting started" />
        <Timeline />
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
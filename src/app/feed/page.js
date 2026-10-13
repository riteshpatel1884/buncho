import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDbUser, isAdmin, getAdminUserIds } from "@/lib/user";
import { getPosts } from "@/lib/feed/feedQueries";
import { TOPICS } from "@/lib/feed/feed";
import { budgetLabel } from "@/lib/projects";
import Avatar from "@/components/Avatar";
import { BlueTick, OfficialTick, isBlueTick } from "@/components/Badges";
import FeedList from "@/components/feed/FeedList";
import PostComposer from "@/components/feed/PostComposer";
import StatsPopup from "@/components/feed/StatsPopup";

export const dynamic = "force-dynamic";
export const metadata = { title: "Feed | buncho" };

const TABS = [
  ["for-you", "For you"],
  ["following", "Following"],
  ["saved", "Saved"],
  ["mine", "My posts"],
];

const TAB_ICON = {
  "for-you": "M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z",
  following: "M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20a6 6 0 0 1 12 0M14 20a5 5 0 0 1 8 0",
  saved: "M6 3h12v18l-6-4-6 4z",
  mine: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
};

function Svg({ d, size = 18 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  );
}

function NavItem({ href, active, icon, label, count }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
        active
          ? "bg-brand-soft text-brand"
          : "text-muted hover:bg-surface-2 hover:text-ink"
      }`}
    >
      {icon && <Svg d={icon} />}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count != null && (
        <span className="text-xs tabular-nums opacity-80">{count}</span>
      )}
    </Link>
  );
}

function SideCard({ title, action, children }) {
  return (
    <section className="card p-4">
      <div className="mb-2 flex items-center justify-between gap-2 px-1">
        <h2 className="font-display text-base">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

const DOTS = {
  backgroundImage:
    "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--on-navy) 22%, transparent) 1px, transparent 0)",
  backgroundSize: "14px 14px",
};

// Official gold seal for Buncho team accounts; blue seal for paid verification.
function Seal({ admin, tick, className = "h-5 w-5" }) {
  if (admin) {
    return (
      <span
        className={`inline-flex shrink-0 items-center justify-center ${className}`}
        aria-label="Official Buncho Team"
        title="Official Buncho Team"
      >
        <OfficialTick className="block h-full w-full shrink-0" />
      </span>
    );
  }

  return tick ? (
    <span
      className={`inline-flex shrink-0 items-center justify-center ${className}`}
      aria-label="Verified"
      title="Verified"
    >
      <BlueTick className="block h-full w-full shrink-0" />
    </span>
  ) : null;
}

// Shared desktop/mobile profile card.
function ProfileHeader({
  me,
  admin,
  tick,
  roleLine,
  adminProfile,
  profileHref,
  postCount,
  followerCount,
  followingCount,
  className = "",
}) {
  const label =
    admin || me.role
      ? me.role === "EXPERT"
        ? "View profile"
        : "Edit profile"
      : "Finish setup";

  return (
    <section className={`card overflow-hidden ${className}`}>
      <div
        className="h-24 bg-navy sm:h-32 lg:h-24"
        style={DOTS}
        aria-hidden="true"
      />

      <div className="px-4 pb-4 sm:px-5">
        <div className="-mt-10 flex items-end justify-between gap-3 sm:-mt-12 lg:-mt-10">
          <Link href={profileHref} className="rounded-[28%] bg-surface p-1">
            <Avatar name={me.name} src={me.avatarUrl} size={80} />
          </Link>

          <Link
            href={profileHref}
            className="btn-outline !rounded-full !px-4 !py-1.5"
          >
            {label}
          </Link>
        </div>

        {/* Keep the name and official badge together on all screen sizes. */}
        <h2 className="mt-2 flex w-fit max-w-full items-center gap-1 font-display text-xl leading-tight">
          <span className="min-w-0 truncate">{me.name || "Your profile"}</span>
          <Seal admin={admin} tick={tick} className="h-5 w-5" />
        </h2>

        {me.username && (
          <p className="text-sm text-muted">@{me.username}</p>
        )}

        {roleLine && <p className="mt-1.5 text-sm">{roleLine}</p>}

        {adminProfile?.about && (
          <p className="mt-1.5 whitespace-pre-line break-words text-sm text-muted">
            {adminProfile.about}
          </p>
        )}

        {adminProfile?.contactInfo && (
          <p className="mt-1.5 break-words text-sm text-muted">
            {adminProfile.contactInfo}
          </p>
        )}

        <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
          <span>
            <b className="text-ink">{postCount}</b>{" "}
            {postCount === 1 ? "Post" : "Posts"}
          </span>
          <span>
            <b className="text-ink">{followingCount}</b> Following
          </span>
          <span>
            <b className="text-ink">{followerCount}</b>{" "}
            {followerCount === 1 ? "Follower" : "Followers"}
          </span>
        </p>
      </div>
    </section>
  );
}

// Phone-only profile strip: avatar, name, role and counts in one compact block, so posts start higher up the screen.
function MobileProfile({ me, admin, tick, roleLine, profileHref, postCount, followerCount, followingCount }) {
  const label = admin || me.role ? (me.role === "EXPERT" ? "View profile" : "Edit profile") : "Finish setup";
  const stat = (n, text) => (
    <div className="px-2 py-2.5 text-center">
      <p className="font-display text-base leading-none tabular-nums">{n}</p>
      <p className="mt-1 text-xs text-muted">{text}</p>
    </div>
  );

  return (
    <section className="card -mx-4 overflow-hidden !rounded-none !border-x-0 sm:mx-0 sm:!rounded-2xl sm:!border-x lg:hidden">
      <div className="h-14 bg-navy" style={DOTS} aria-hidden="true" />
      <div className="px-4 pb-3">
        <div className="-mt-7 flex items-end justify-between gap-3">
          <Link href={profileHref} className="rounded-[28%] bg-surface p-1">
            <Avatar name={me.name} src={me.avatarUrl} size={60} />
          </Link>
          <Link href={profileHref} className="btn-outline !rounded-full !px-4 !py-1.5 !text-[13px]">
            {label}
          </Link>
        </div>
        <h2 className="mt-2 flex w-fit max-w-full items-center gap-1 font-display text-lg leading-tight">
          <span className="min-w-0 truncate">{me.name || "Your profile"}</span>
          <Seal admin={admin} tick={tick} className="h-[18px] w-[18px]" />
        </h2>
        <p className="truncate text-[13px] text-muted">
          {me.username ? `@${me.username} · ` : ""}
          {roleLine}
        </p>
      </div>
      <div className="grid grid-cols-3 divide-x divide-line border-t border-line">
        {stat(postCount, postCount === 1 ? "Post" : "Posts")}
        {stat(followerCount, followerCount === 1 ? "Follower" : "Followers")}
        {stat(followingCount, "Following")}
      </div>
    </section>
  );
}

function JoinCard({ signInHref, className = "" }) {
  return (
    <section className={`card p-5 ${className}`}>
      <p className="font-display text-lg leading-snug">Join the conversation</p>
      <p className="mt-1 text-sm text-muted">
        Post, follow experts and save what you want to read later.
      </p>
      <Link
        href="/sign-up"
        className="btn-primary mt-4 w-full !rounded-full"
      >
        Join Buncho
      </Link>
      <Link
        href={signInHref}
        className="mt-2 block text-center text-sm font-medium text-muted hover:text-brand"
      >
        I already have an account
      </Link>
    </section>
  );
}

const ICON = {
  heart: "M12 21s-7.5-4.6-9.5-9.2C1 8.4 3 5 6.4 5c2 0 3.6 1 4.6 2.6C12 6 13.6 5 15.6 5 19 5 21 8.4 19.5 11.8 19.5 11.8 12 21 12 21z",
  chat: "M4 5h16v11H9l-5 4z",
  mark: "M6 3h12v18l-6-4-6 4z",
  users: "M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20a6 6 0 0 1 12 0M14 20a5 5 0 0 1 8 0",
  doc: "M7 3h7l5 5v13H7zM14 3v5h5M10 13h6M10 17h6",
  trend: "M3 17l6-6 4 4 8-8M15 7h6v6",
};

function StatTile({ icon, label, value, color = "text-brand bg-brand-soft" }) {
  return (
    <div className="rounded-xl border border-line p-3">
      <span
        className={`flex h-8 w-8 items-center justify-center rounded-lg ${color}`}
      >
        <Svg d={ICON[icon]} size={16} />
      </span>
      <p className="mt-2 font-display text-xl leading-none tabular-nums">
        {value}
      </p>
      <p className="mt-1 text-xs text-muted">{label}</p>
    </div>
  );
}

function StatsBody({ s }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2.5">
        <StatTile
          icon="doc"
          label={s.posts === 1 ? "Post" : "Posts"}
          value={s.posts}
        />
        <StatTile
          icon="heart"
          label={s.likes === 1 ? "Like" : "Likes"}
          value={s.likes}
          color="text-[#f43f5e] bg-[#f43f5e]/10"
        />
        <StatTile
          icon="chat"
          label={s.comments === 1 ? "Comment" : "Comments"}
          value={s.comments}
        />
        <StatTile
          icon="mark"
          label={s.saves === 1 ? "Bookmark" : "Bookmarks"}
          value={s.saves}
        />
        <StatTile
          icon="users"
          label={s.followers === 1 ? "Follower" : "Followers"}
          value={s.followers}
        />
        <StatTile
          icon="users"
          label="Following"
          value={s.following}
          color="text-muted bg-surface-2"
        />
      </div>

      <dl className="space-y-2 rounded-xl bg-surface-2 p-3 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Likes per post</dt>
          <dd className="font-semibold tabular-nums">{s.avgLikes}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Interactions per post</dt>
          <dd className="font-semibold tabular-nums">{s.avgInteractions}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted">Posts in the last 7 days</dt>
          <dd className="font-semibold tabular-nums">{s.weekPosts}</dd>
        </div>
        {s.topTopic && (
          <div className="flex items-center justify-between gap-3">
            <dt className="text-muted">Best topic</dt>
            <dd className="font-semibold text-brand">
              #{TOPICS[s.topTopic] ?? s.topTopic}
            </dd>
          </div>
        )}
      </dl>

      {s.top ? (
        <Link
          href={`/feed/${s.top.id}`}
          className="block rounded-xl border border-brand/20 bg-brand-soft/60 p-3 transition-colors hover:border-brand"
        >
          <p className="flex items-center gap-1.5 text-xs font-semibold text-brand">
            <Svg d={ICON.trend} size={14} />
            Top post
          </p>
          <p className="mt-1 line-clamp-2 whitespace-pre-line break-words text-sm leading-snug">
            {s.top.body}
          </p>
          <p className="mt-2 flex gap-3 text-xs text-muted">
            <span>{s.top._count.likes} likes</span>
            <span>{s.top._count.comments} comments</span>
            <span>{s.top._count.saves} saves</span>
          </p>
        </Link>
      ) : (
        <p className="rounded-xl border border-dashed border-line p-3 text-center text-sm text-muted">
          Your top post shows up here after you publish.
        </p>
      )}
    </div>
  );
}

// Wide screens: stats card. Smaller screens: popup.
function MyStats({ s, collapsible = false }) {
  if (collapsible) {
    return (
      <div className="xl:hidden">
        <StatsPopup
          summary={`${s.likes} likes · ${s.comments} comments · ${s.saves} bookmarks`}
        >
          <StatsBody s={s} />
        </StatsPopup>
      </div>
    );
  }

  return (
    <section className="card hidden p-4 xl:block">
      <h2 className="mb-3 px-1 font-display text-base">Your stats</h2>
      <StatsBody s={s} />
    </section>
  );
}

export default async function FeedPage({ searchParams }) {
  const sp = await searchParams;
  const me = await getDbUser().catch(() => null);
  const admin = await isAdmin().catch(() => false);
  const signedIn = !!me;
  const topic = Object.hasOwn(TOPICS, sp.topic) ? sp.topic : "";
  const college = (sp.college || "").trim();
  const tab = TABS.some(([k]) => k === sp.tab) ? sp.tab : "for-you";
  const needsSignIn = !signedIn && tab !== "for-you";
  const mine = tab === "mine" && signedIn;
  const visibleTabs = signedIn ? TABS : TABS.slice(0, 3);

  const href = (over = {}) => {
    const q = new URLSearchParams();
    const v = { tab, topic, college, ...over };

    Object.entries(v).forEach(([k, val]) => {
      if (val && !(k === "tab" && val === "for-you")) q.set(k, val);
    });

    const s = q.toString();
    return s ? `/feed?${s}` : "/feed";
  };

  // Team accounts are automatically followed for display purposes.
  const adminIds = me ? await getAdminUserIds().catch(() => []) : [];
  const autoFollowed = adminIds.filter((id) => id !== me?.id).length;

  // Fetch the admin's custom profile fields for the profile card.
  const adminProfile =
    admin && me
      ? await prisma.adminProfile
          .findUnique({
            where: { userId: me.id },
            select: { headline: true, about: true, contactInfo: true },
          })
          .catch(() => null)
      : null;

  const [
    initial,
    services,
    profile,
    postCount,
    followerCount,
    suggested,
    projects,
    topicCounts,
    followingCount,
    myPosts,
  ] = await Promise.all([
    needsSignIn
      ? { posts: [], nextCursor: null }
      : getPosts({
          viewerId: me?.id ?? null,
          topic,
          college,
          tab,
          ...(mine ? { authorId: me.id } : {}),
        }),

    me?.role === "EXPERT"
      ? prisma.service.findMany({
          where: { expert: { userId: me.id }, active: true },
          select: { id: true, title: true, priceInr: true },
          orderBy: { createdAt: "desc" },
        })
      : [],

    me?.role === "EXPERT"
      ? prisma.expertProfile
          .findUnique({
            where: { userId: me.id },
            select: {
              slug: true,
              jobTitle: true,
              company: true,
              blueTickUntil: true,
            },
          })
          .catch(() => null)
      : me?.role === "STUDENT"
        ? prisma.studentProfile
            .findUnique({
              where: { userId: me.id },
              select: { college: true, targetRole: true },
            })
            .catch(() => null)
        : null,

    me
      ? prisma.post
          .count({ where: { authorId: me.id, hidden: false } })
          .catch(() => 0)
      : 0,

    me
  ? adminIds.includes(me.id)
    ? prisma.user
        .count({
          where: {
            id: { notIn: adminIds },
          },
        })
        .catch(() => 0)
    : prisma.follow
        .count({
          where: { followingId: me.id },
        })
        .catch(() => 0)
  : 0,

    prisma.expertProfile
      .findMany({
        where: {
          status: "ACTIVE",
          ...(me
            ? {
                userId: { not: me.id },
                user: { followers: { none: { followerId: me.id } } },
              }
            : {}),
        },
        orderBy: { createdAt: "desc" },
        take: 4,
        select: {
          slug: true,
          jobTitle: true,
          company: true,
          blueTickUntil: true,
          userId: true,
          user: { select: { name: true, avatarUrl: true } },
        },
      })
      .catch(() => []),

    prisma.project
      .findMany({
        where: { status: "OPEN" },
        orderBy: { createdAt: "desc" },
        take: 3,
        select: {
          id: true,
          title: true,
          budgetMode: true,
          budgetMinInr: true,
          budgetMaxInr: true,
        },
      })
      .catch(() => []),

    prisma.post
      .groupBy({
        by: ["topic"],
        where: { hidden: false, topic: { not: null } },
        _count: { _all: true },
      })
      .catch(() => []),

    me
      ? prisma.follow
          .count({
            where: {
              followerId: me.id,
              followingId: { notIn: adminIds },
            },
          })
          .then((n) => n + autoFollowed)
          .catch(() => autoFollowed)
      : 0,

    me
      ? prisma.post
          .findMany({
            where: { authorId: me.id, hidden: false },
            orderBy: { createdAt: "desc" },
            take: 500,
            select: {
              id: true,
              body: true,
              topic: true,
              createdAt: true,
              _count: {
                select: { likes: true, comments: true, saves: true },
              },
            },
          })
          .catch(() => [])
      : [],
  ]);

  const interactions = (p) =>
    p._count.likes + p._count.comments + p._count.saves;
  const weekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;

  const sum = myPosts.reduce(
    (a, p) => ({
      likes: a.likes + p._count.likes,
      comments: a.comments + p._count.comments,
      saves: a.saves + p._count.saves,
    }),
    { likes: 0, comments: 0, saves: 0 }
  );

  const byTopic = new Map();

  for (const p of myPosts) {
    if (p.topic) {
      byTopic.set(
        p.topic,
        (byTopic.get(p.topic) ?? 0) + interactions(p)
      );
    }
  }

  const per = (n) => (postCount ? Math.round((n / postCount) * 10) / 10 : 0);

  const stats = me
    ? {
        posts: postCount,
        followers: followerCount,
        following: followingCount,
        ...sum,
        avgLikes: per(sum.likes),
        avgInteractions: per(sum.likes + sum.comments + sum.saves),
        weekPosts: myPosts.filter(
          (p) => p.createdAt.getTime() >= weekAgo
        ).length,
        top: myPosts.reduce(
          (best, p) =>
            interactions(p) > 0 &&
            (!best || interactions(p) > interactions(best))
              ? p
              : best,
          null
        ),
        topTopic:
          [...byTopic.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null,
      }
    : null;

  const counts = new Map(
    topicCounts.map((t) => [t.topic, t._count._all])
  );

  const canPost =
    me?.role === "EXPERT" || me?.role === "STUDENT" || admin;

  const empty =
    tab === "following"
      ? {
          title: "You're not following anyone yet",
          text: "Follow people from the For you feed and their posts will show up here.",
          href: "/feed",
          cta: "Browse the feed",
        }
      : tab === "saved"
        ? {
            title: "No saved posts yet",
            text: "Tap the bookmark on a post to keep it for later.",
          }
        : tab === "mine"
          ? {
              title: "You haven't posted yet",
              text: canPost
                ? "Use Create post above to share a lesson, a build or a question."
                : "Finish setting up your account to start posting.",
            }
          : topic || college
            ? {
                title: "No posts match these filters",
                text: "Try another topic, or clear the college filter.",
                href: "/feed",
                cta: "Clear filters",
              }
            : undefined;

  // Plain data for the empty state's "experts worth following" list.
  const expertPrompts = suggested.map((e) => ({
    id: e.userId,
    slug: e.slug,
    name: e.user.name,
    avatarUrl: e.user.avatarUrl,
    subtitle: `${e.jobTitle} at ${e.company}`,
    tick: isBlueTick(e),
  }));

  const roleLine = admin
    ? adminProfile?.headline || "Buncho team"
    : profile?.jobTitle && profile?.company
      ? `${profile.jobTitle} at ${profile.company}`
      : profile?.college
        ? `Student, ${profile.college}`
        : me?.role === "STUDENT"
          ? "Student"
          : "Finish setting up";

  const tickUntil =
    me?.role === "EXPERT" ? profile?.blueTickUntil : me?.blueTickUntil;
  const tick = !admin && isBlueTick({ blueTickUntil: tickUntil });

  const profileHref = admin
    ? "/onboarding/admin/profile"
    : profile?.slug
      ? `/experts/${profile.slug}`
      : me?.role
        ? "/dashboard/profile"
        : "/onboarding";

  const collegeForm = (
    <form className="flex gap-2" data-nav role="search">
              {tab !== "for-you" && (
                <input type="hidden" name="tab" value={tab} />
              )}
              {topic && <input type="hidden" name="topic" value={topic} />}

              <div className="relative min-w-0 flex-1">
                <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
                  <Svg
                    d="M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3"
                    size={16}
                  />
                </span>
                <input
                  name="college"
                  defaultValue={college}
                  placeholder="Filter posts by college"
                  aria-label="Filter posts by college"
                  className="input !rounded-full !pl-10"
                />
              </div>

              <button className="btn-outline shrink-0 !rounded-full">
                Filter
              </button>

              {college && (
                <Link
                  href={href({ college: "" })}
                  className="btn-outline shrink-0 !rounded-full"
                >
                  Clear
                </Link>
              )}
            </form>
  );

  const topicChip = (active) =>
    `shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
      active
        ? "border-brand bg-brand text-on-brand"
        : "border-line bg-surface text-muted hover:border-brand hover:text-ink"
    }`;

  return (
    <div className="relative left-1/2 w-[min(calc(100vw-2rem),1480px)] -translate-x-1/2 sm:w-[min(calc(100vw-3rem),1480px)]">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-8 xl:grid-cols-[290px_minmax(0,1fr)_350px] xl:gap-10">
        <h1 className="sr-only">Buncho Feed</h1>

        <aside className="hidden lg:block">
          <div className="sticky top-24 space-y-4">
            {me ? (
              <ProfileHeader
                me={me}
                admin={admin}
                tick={tick}
                roleLine={roleLine}
                adminProfile={adminProfile}
                profileHref={profileHref}
                postCount={postCount}
                followerCount={followerCount}
                followingCount={followingCount}
              />
            ) : (
              <JoinCard
                signInHref={`/sign-in?redirect_url=${encodeURIComponent(href())}`}
              />
            )}

            <nav aria-label="Feed" className="card space-y-0.5 p-2">
              {visibleTabs.map(([k, label]) => (
                <NavItem
                  key={k}
                  href={href({ tab: k })}
                  active={tab === k}
                  icon={TAB_ICON[k]}
                  label={label}
                />
              ))}
            </nav>

            <SideCard title="Topics">
              <nav aria-label="Topics" className="space-y-0.5">
                <NavItem
                  href={href({ topic: "" })}
                  active={!topic}
                  label="All topics"
                />
                {Object.entries(TOPICS).map(([k, label]) => (
                  <NavItem
                    key={k}
                    href={href({ topic: k })}
                    active={topic === k}
                    label={`#${label}`}
                    count={counts.get(k) ?? 0}
                  />
                ))}
              </nav>
            </SideCard>
          </div>
        </aside>

        {/* On phones the cards run edge to edge, and the bottom padding keeps the last post clear of the tab bar. */}
        <div className="min-w-0 space-y-3 pb-24 sm:space-y-4 md:pb-0">
          {me ? (
            <MobileProfile
              me={me}
              admin={admin}
              tick={tick}
              roleLine={roleLine}
              profileHref={profileHref}
              postCount={postCount}
              followerCount={followerCount}
              followingCount={followingCount}
            />
          ) : (
            <JoinCard
              className="lg:hidden"
              signInHref={`/sign-in?redirect_url=${encodeURIComponent(href())}`}
            />
          )}

          {stats && <MyStats s={stats} collapsible />}

          <div className="sticky top-[4.25rem] z-30 -mx-4 border-b border-line/60 bg-paper/85 px-4 py-2 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:hidden">
            <nav
              aria-label="Feed"
              className="flex gap-1 rounded-full border border-line bg-surface p-1"
            >
              {visibleTabs.map(([k, label]) => (
                <Link
                  key={k}
                  href={href({ tab: k })}
                  aria-current={tab === k ? "page" : undefined}
                  className={`min-w-0 flex-1 truncate rounded-full px-2 py-2 text-center text-sm font-medium transition-colors ${
                    tab === k
                      ? "bg-brand text-on-brand shadow-sm"
                      : "text-muted hover:text-ink"
                  }`}
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>

          {canPost && (
            <PostComposer
              services={services}
              optionalTopic={admin}
              user={me ? { name: me.name, avatarUrl: me.avatarUrl } : null}
            />
          )}

          <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0 lg:hidden">
            <Link href={href({ topic: "" })} className={topicChip(!topic)}>
              All
            </Link>
            {Object.entries(TOPICS).map(([k, label]) => (
              <Link
                key={k}
                href={href({ topic: k })}
                className={topicChip(topic === k)}
              >
                #{label}
              </Link>
            ))}
          </div>

          {tab !== "mine" && (
            <>
              <details className="lg:hidden" open={!!college}>
                <summary className="flex w-fit cursor-pointer list-none items-center gap-2 rounded-full border border-line bg-surface px-3.5 py-1.5 text-sm font-medium text-muted transition-colors hover:border-brand hover:text-ink [&::-webkit-details-marker]:hidden">
                  <Svg d="M3 5h18l-7 8v6l-4 2v-8z" size={15} />
                  {college ? `College: ${college}` : "Filter by college"}
                </summary>
                <div className="mt-2">{collegeForm}</div>
              </details>
              <div className="hidden lg:block">{collegeForm}</div>
            </>
          )}
          {needsSignIn ? (
            <div className="card flex flex-col items-center px-6 py-14 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
                <Svg d={TAB_ICON[tab]} size={26} />
              </span>
              <p className="mt-4 font-display text-xl">Sign in to see this</p>
              <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">
                Following, saved and your own posts are tied to your account.
                Browsing the feed is always free.
              </p>
              <Link
                href={`/sign-in?redirect_url=${encodeURIComponent(href())}`}
                className="btn-primary mt-5 !rounded-full"
              >
                Sign in
              </Link>
            </div>
          ) : (
            <FeedList
              key={`${tab}|${topic}|${college}`}
              initial={initial}
              filters={{
                tab,
                topic,
                college,
                ...(mine ? { authorId: me.id } : {}),
              }}
              signedIn={signedIn}
              empty={empty}
              editable={mine}
              canPost={canPost}
              experts={tab === "mine" || tab === "saved" ? [] : expertPrompts}
            />
          )}
        </div>

        <aside className="hidden xl:block">
          <div className="sticky top-24 space-y-4">
            {stats && <MyStats s={stats} />}

            {suggested.length > 0 && (
              <SideCard
                title="Experts to follow"
                action={
                  <Link
                    href="/experts"
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    See all
                  </Link>
                }
              >
                <ul className="space-y-1">
                  {suggested.map((e) => (
                    <li key={e.slug}>
                      <Link
                        href={`/experts/${e.slug}`}
                        className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-2"
                      >
                        <Avatar
                          name={e.user.name}
                          src={e.user.avatarUrl}
                          size={40}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5 text-sm font-semibold">
                            <span className="truncate">
                              {e.user.name || "Expert"}
                            </span>
                            {isBlueTick(e) && (
                              <BlueTick className="h-3.5 w-3.5 shrink-0" />
                            )}
                          </span>
                          <span className="block truncate text-xs text-muted">
                            {e.jobTitle} at {e.company}
                          </span>
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </SideCard>
            )}

            {projects.length > 0 && (
              <SideCard
                title="Open collabs"
                action={
                  <Link
                    href="/projects"
                    className="text-xs font-semibold text-brand hover:underline"
                  >
                    See all
                  </Link>
                }
              >
                <ul className="space-y-1">
                  {projects.map((p) => (
                    <li key={p.id}>
                      <Link
                        href={`/projects/${p.id}`}
                        className="block rounded-xl p-2 transition-colors hover:bg-surface-2"
                      >
                        <span className="line-clamp-2 text-sm font-medium leading-snug">
                          {p.title}
                        </span>
                        <span className="mt-0.5 block text-xs font-semibold text-brand">
                          {budgetLabel(p)}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </SideCard>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
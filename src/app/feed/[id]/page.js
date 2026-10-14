import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDbUser, getAdminUserIds } from "@/lib/user";
import { getPosts } from "@/lib/feed/feedQueries";
import Avatar from "@/components/Avatar";
import { BlueTick, OfficialTick } from "@/components/Badges";
import PostCard from "@/components/feed/PostCard";
import AuthorFollow from "@/components/feed/AuthorFollow";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { posts } = await getPosts({ postId: id });
  const p = posts[0];
  return p ? { title: `${p.author.name} on Buncho`, description: p.body.slice(0, 150) } : {};
}

const DOTS = {
  backgroundImage: "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--on-navy) 22%, transparent) 1px, transparent 0)",
  backgroundSize: "14px 14px",
};

// The post owner's public profile card. Shown to everyone, signed in or not.
function AuthorCard({ a, roleLine, headline, postCount, followingCount, signedIn, mine, profileHref, returnTo }) {
  return (
    <section className="card overflow-hidden">
      <div className="h-20 bg-navy sm:h-24" style={DOTS} aria-hidden="true" />
      <div className="px-4 pb-5 sm:px-5">
        <div className="-mt-10 flex items-end justify-between gap-3">
          <div className="rounded-[28%] bg-surface p-1">
            <Avatar name={a.name} src={a.avatarUrl} color={a.avatarColor} icon={a.avatarIcon} admin={a.isAdmin} size={80} />
          </div>
          {profileHref && (
            <Link href={profileHref} className="btn-outline !rounded-full !px-4 !py-1.5">
              {mine ? "Edit profile" : "Full profile"}
            </Link>
          )}
        </div>

        <h2 className="mt-2 flex w-fit max-w-full items-center gap-1 font-display text-xl leading-tight">
          <span className="min-w-0 break-words">{a.name || "Buncho member"}</span>
          {a.isAdmin ? <OfficialTick className="h-5 w-5 shrink-0" /> : a.blueTick && <BlueTick className="h-5 w-5 shrink-0" />}
        </h2>
        {a.username && <p className="text-sm text-muted">@{a.username}</p>}
        {roleLine && <p className="mt-1.5 text-sm">{roleLine}</p>}
        {headline && <p className="mt-1.5 break-words text-sm text-muted">{headline}</p>}
        {!a.isAdmin && a.verified && (
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-mint-soft px-2.5 py-0.5 text-xs font-semibold text-mint">✓ Verified by Buncho</span>
        )}

        <AuthorFollow
          authorId={a.id}
          initialFollowing={a.following}
          initialFollowers={a.followers}
          posts={postCount}
          following={followingCount}
          signedIn={signedIn}
          mine={mine}
          canFollow={!a.isAdmin}
          returnTo={returnTo}
        />
      </div>
    </section>
  );
}

export default async function PostPage({ params }) {
  const { id } = await params;
  const me = await getDbUser().catch(() => null);
  const { posts } = await getPosts({ viewerId: me?.id ?? null, postId: id });
  const post = posts[0];
  if (!post) notFound();
  const a = post.author;

  const adminIds = await getAdminUserIds().catch(() => []);
  const [postCount, followingDb, extra, adminProfile] = await Promise.all([
    prisma.post.count({ where: { authorId: a.id, hidden: false } }).catch(() => 0),
    prisma.follow.count({ where: { followerId: a.id, followingId: { notIn: adminIds } } }).catch(() => 0),
    a.slug ? prisma.expertProfile.findUnique({ where: { userId: a.id }, select: { headline: true } }).catch(() => null) : null,
    a.isAdmin ? prisma.adminProfile.findUnique({ where: { userId: a.id }, select: { headline: true } }).catch(() => null) : null,
  ]);
  // Same rule as the feed: everyone follows the Buncho team without clicking anything.
  const followingCount = followingDb + adminIds.filter((x) => x !== a.id).length;

  const roleLine = a.isAdmin
    ? "Official Buncho Team"
    : a.jobTitle && a.company
      ? `${a.jobTitle} at ${a.company}`
      : a.role === "STUDENT"
        ? a.college ? `Student, ${a.college}` : "Student"
        : "Expert";
  const headline = a.isAdmin ? adminProfile?.headline : extra?.headline;
  const mine = me?.id === a.id;
  const profileHref = a.isAdmin ? (mine ? "/onboarding/admin/profile" : null) : a.slug ? `/experts/${a.slug}` : mine ? "/dashboard/profile" : null;

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link href="/feed" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-brand">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        Back to feed
      </Link>

      {/* Phones: profile on top, post below. From lg up: profile on the left (stays in view), post on the right. */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside className="lg:sticky lg:top-24">
          <AuthorCard
            a={a}
            roleLine={roleLine}
            headline={headline}
            postCount={postCount}
            followingCount={followingCount}
            signedIn={!!me}
            mine={mine}
            profileHref={profileHref}
            returnTo={`/feed/${post.id}`}
          />
        </aside>
        <div className="min-w-0">
          <PostCard post={post} signedIn={!!me} defaultOpen hideFollow />
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";
import { getPosts } from "@/lib/feed/feedQueries";
import { getPublicProfile } from "@/lib/feed/profile";
import PostCard from "@/components/feed/PostCard";
import ProfileSide from "@/components/feed/ProfileSide";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const { posts } = await getPosts({ postId: id });
  const p = posts[0];
  return p ? { title: `${p.author.name} on Buncho`, description: p.body.slice(0, 150) } : {};
}

export default async function PostPage({ params }) {
  const { id } = await params;
  const me = await getDbUser().catch(() => null);
  const { posts } = await getPosts({ viewerId: me?.id ?? null, postId: id });
  const post = posts[0];
  if (!post) notFound();

  const [profile, grouped] = await Promise.all([
    getPublicProfile(post.author.id, me?.id ?? null),
    prisma.post.groupBy({ by: ["topic"], where: { hidden: false, topic: { not: null } }, _count: { _all: true } }).catch(() => []),
  ]);
  if (!profile) notFound();
  const topicCounts = new Map(grouped.map((t) => [t.topic, t._count._all]));

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link href="/feed" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-brand">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        Back to feed
      </Link>

      {/* Phones: profile on top, post below. From lg up: profile column on the left, post on the right. */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside>
          <ProfileSide profile={profile} signedIn={!!me} returnTo={`/feed/${post.id}`} topicCounts={topicCounts} />
        </aside>
        <div className="min-w-0">
          <PostCard post={post} signedIn={!!me} defaultOpen hideFollow />
        </div>
      </div>
    </div>
  );
}

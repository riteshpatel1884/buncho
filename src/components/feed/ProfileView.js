import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPosts } from "@/lib/feed/feedQueries";
import { profilePath } from "@/lib/feed/feed";
import FeedList from "@/components/feed/FeedList";
import ProfileSide from "@/components/feed/ProfileSide";

export default async function ProfileView({ profile, me }) {
  const [initial, grouped] = await Promise.all([
    getPosts({ viewerId: me?.id ?? null, profileId: profile.id }),
    prisma.post.groupBy({ by: ["topic"], where: { hidden: false, topic: { not: null } }, _count: { _all: true } }).catch(() => []),
  ]);
  const topicCounts = new Map(grouped.map((t) => [t.topic, t._count._all]));

  return (
    <div className="mx-auto max-w-5xl space-y-5">
      <Link href="/feed" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-brand">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        Back to feed
      </Link>
      <h1 className="sr-only">{profile.name}</h1>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start lg:gap-8">
        <aside>
          <ProfileSide profile={profile} signedIn={!!me} returnTo={profilePath(profile)} topicCounts={topicCounts} />
        </aside>
        <div className="min-w-0 space-y-3 pb-24 sm:space-y-4 md:pb-0">
          <FeedList
            key={profile.id}
            initial={initial}
            filters={{ profileId: profile.id }}
            signedIn={!!me}
            hideFollow
            empty={{ title: "No posts yet", text: `${profile.name || "This person"} hasn't posted anything yet.` }}
          />
        </div>
      </div>
    </div>
  );
}
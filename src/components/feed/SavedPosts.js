import Link from "next/link";
import { getPosts } from "@/lib/feed/feedQueries";
import FeedList from "./FeedList";

// Student dashboard: every post the student bookmarked. Scrolls on to load more.
export default async function SavedPosts({ viewerId }) {
  const initial = await getPosts({ viewerId, tab: "saved" });
  return (
    <section id="saved" className="space-y-4">
      <div className="flex items-baseline justify-between gap-3">
        <h2 className="font-display text-xl">Saved posts</h2>
        <Link href="/feed" className="text-sm font-semibold text-brand hover:underline">Browse the feed</Link>
      </div>
      <FeedList
        initial={initial}
        filters={{ tab: "saved", topic: "", college: "" }}
        signedIn
        empty={{ title: "No saved posts yet.", text: "Tap the bookmark on any post in the feed to keep it here.", href: "/feed", cta: "Browse the feed" }}
      />
    </section>
  );
}
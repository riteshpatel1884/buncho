import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getPosts } from "@/lib/feed/feedQueries";
import FeedList from "./FeedList";

// Expert dashboard: everything this expert has posted, newest first.
export default async function MyPosts({ userId }) {
  const [initial, total] = await Promise.all([
    getPosts({ viewerId: userId, authorId: userId }),
    prisma.post.count({ where: { authorId: userId, hidden: false } }),
  ]);
  return (
    <section id="my-posts" className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 font-display text-xl">
          Your posts
          <span className="rounded-full bg-surface-2 px-2 py-0.5 text-xs font-semibold text-muted">{total}</span>
        </h2>
        <Link href="/feed" className="btn-primary !py-2">Write a post</Link>
      </div>
      <FeedList
        initial={initial}
        filters={{ tab: "for-you", topic: "", college: "", authorId: userId }}
        signedIn
        empty={{ title: "You haven't posted yet.", text: "Share a lesson or a tip. Students can read it free and you may get new requests.", href: "/feed", cta: "Write your first post" }}
      />
    </section>
  );
}
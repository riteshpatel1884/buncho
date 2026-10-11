import Link from "next/link";
import { notFound } from "next/navigation";
import { getDbUser } from "@/lib/user";
import { getPosts } from "@/lib/feed/feedQueries";
import PostCard from "@/components/feed/PostCard";

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
  if (!posts[0]) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Link href="/feed" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-brand">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
        Back to feed
      </Link>
      <PostCard post={posts[0]} signedIn={!!me} defaultOpen />
    </div>
  );
}
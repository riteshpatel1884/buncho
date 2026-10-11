import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDbUser, isAdmin } from "@/lib/user";
import { getPosts } from "@/lib/feed/feedQueries";
import { TOPICS } from "@/lib/feed/feed";
import FeedList from "@/components/feed/FeedList";
import PostComposer from "@/components/feed/PostComposer";
export const dynamic = "force-dynamic";
export const metadata = { title: "Feed | buncho" };

const TABS = [["for-you", "For you"], ["following", "Following"], ["saved", "Saved"]];

export default async function FeedPage({ searchParams }) {
  const sp = await searchParams;
  const me = await getDbUser().catch(() => null);
  const admin = await isAdmin().catch(() => false);
  const signedIn = !!me;
  const topic = Object.hasOwn(TOPICS, sp.topic) ? sp.topic : "";
  const college = (sp.college || "").trim();
  const tab = TABS.some(([k]) => k === sp.tab) ? sp.tab : "for-you";
  const needsSignIn = !signedIn && tab !== "for-you";

  const href = (over = {}) => {
    const q = new URLSearchParams();
    const v = { tab, topic, college, ...over };
    Object.entries(v).forEach(([k, val]) => val && !(k === "tab" && val === "for-you") && q.set(k, val));
    const s = q.toString();
    return s ? `/feed?${s}` : "/feed";
  };

  const [initial, services] = await Promise.all([
    needsSignIn ? { posts: [], nextCursor: null } : getPosts({ viewerId: me?.id ?? null, topic, college, tab }),
    me?.role === "EXPERT"
      ? prisma.service.findMany({ where: { expert: { userId: me.id }, active: true }, select: { id: true, title: true, priceInr: true }, orderBy: { createdAt: "desc" } })
      : [],
  ]);
  // Experts and the admin can post.
  const canPost = me?.role === "EXPERT" || admin;
  const empty =
    tab === "following"
      ? { title: "You're not following anyone yet.", text: "Follow experts from the For you feed and their posts will show up here.", href: "/feed", cta: "Browse the feed" }
      : tab === "saved"
        ? { title: "No saved posts yet.", text: "Tap the bookmark on a post to keep it for later." }
        : undefined;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl leading-tight sm:text-4xl">Buncho Feed</h1>
      </div>

      {canPost && <PostComposer services={services} optionalTopic={admin} />}

      <div className="space-y-3">
        <div className="flex gap-1 border-b border-line">
          {TABS.map(([k, label]) => (
            <Link key={k} href={href({ tab: k })} className={`-mb-px border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${tab === k ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink"}`}>
              {label}
            </Link>
          ))}
        </div>
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <Link href={href({ topic: "" })} className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium ${!topic ? "border-brand bg-brand-soft text-brand" : "border-line bg-surface"}`}>All</Link>
          {Object.entries(TOPICS).map(([k, label]) => (
            <Link key={k} href={href({ topic: k })} className={`shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium ${topic === k ? "border-brand bg-brand-soft text-brand" : "border-line bg-surface"}`}>{label}</Link>
          ))}
        </div>
        <form className="flex gap-2" data-nav>
          {tab !== "for-you" && <input type="hidden" name="tab" value={tab} />}
          {topic && <input type="hidden" name="topic" value={topic} />}
          <input name="college" defaultValue={college} placeholder="Filter by college" className="input" />
          <button className="btn-outline shrink-0">Filter</button>
          {college && <Link href={href({ college: "" })} className="btn-outline shrink-0">Clear</Link>}
        </form>
      </div>

      {needsSignIn ? (
        <div className="rounded-xl border border-dashed border-line p-10 text-center">
          <p className="font-display text-xl">Sign in to see this</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">Following and saved posts are tied to your account. Browsing the feed is always free.</p>
          <Link href={`/sign-in?redirect_url=${encodeURIComponent(href())}`} className="btn-primary mt-5">Sign in</Link>
        </div>
      ) : (
        <FeedList key={`${tab}|${topic}|${college}`} initial={initial} filters={{ tab, topic, college }} signedIn={signedIn} empty={empty} />
      )}
    </div>
  );
}
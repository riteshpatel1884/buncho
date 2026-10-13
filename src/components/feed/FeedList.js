"use client";
import { useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import PostCard from "./PostCard";
import EditablePost from "./EditablePost";
import Avatar from "../Avatar";
import { BlueTick } from "../Badges";
import { showToast } from "../Toast";
import { loadPosts, toggleFollow } from "@/app/feed/actions";

const MODE_KEY = "buncho-feed-mode";
// Phones get edge-to-edge cards; larger screens get rounded ones. Same classes as PostCard.
const CARD_EDGE = "card -mx-4 !rounded-none !border-x-0 sm:mx-0 sm:!rounded-2xl sm:!border-x";

function PostSkeleton() {
  return (
    <div className={`${CARD_EDGE} space-y-4 p-4 sm:p-5`} aria-hidden="true">
      <div className="flex items-center gap-3">
        <div className="skeleton h-11 w-11 !rounded-[28%]" />
        <div className="flex-1 space-y-2">
          <div className="skeleton h-3.5 w-1/3" />
          <div className="skeleton h-3 w-1/2" />
        </div>
      </div>
      <div className="space-y-2">
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-3.5 w-11/12" />
        <div className="skeleton h-3.5 w-2/3" />
      </div>
      <div className="flex gap-2 border-t border-line pt-3">
        <div className="skeleton h-9 w-16 !rounded-full" />
        <div className="skeleton h-9 w-16 !rounded-full" />
        <div className="skeleton h-9 w-10 !rounded-full" />
        <div className="skeleton ml-auto h-9 w-10 !rounded-full" />
      </div>
    </div>
  );
}

function Svg({ d, size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

const openComposer = () => window.dispatchEvent(new Event("buncho:compose"));

// One suggested expert with a Follow button that works in place.
function ExpertRow({ e, signedIn }) {
  const [following, setFollowing] = useState(false);
  const [, startTransition] = useTransition();
  const signIn = `/sign-in?redirect_url=${encodeURIComponent("/feed")}`;

  function follow() {
    const next = !following;
    setFollowing(next);
    showToast(next ? `You're following ${e.name}` : `Unfollowed ${e.name}`, next ? "success" : "info");
    startTransition(async () => {
      const res = await toggleFollow(e.id);
      if (res?.error) {
        setFollowing(!next);
        showToast(res.error, "info");
      }
    });
  }

  return (
    <li className="flex items-center gap-3 py-2.5">
      <Link href={`/experts/${e.slug}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Avatar name={e.name} src={e.avatarUrl} size={44} />
        <span className="min-w-0">
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <span className="truncate">{e.name || "Expert"}</span>
            {e.tick && <BlueTick className="h-4 w-4 shrink-0" />}
          </span>
          <span className="block truncate text-xs text-muted">{e.subtitle}</span>
        </span>
      </Link>
      {signedIn ? (
        <button type="button" onClick={follow} className={`shrink-0 cursor-pointer ${following ? "btn-outline" : "btn-primary"} !rounded-full !px-4 !py-1.5 !text-[13px]`}>
          {following ? "Following" : "Follow"}
        </button>
      ) : (
        <Link href={signIn} className="btn-primary shrink-0 !rounded-full !px-4 !py-1.5 !text-[13px]">Follow</Link>
      )}
    </li>
  );
}

// Shared by the empty state and the "only a few posts" footer.
function Prompts({ experts, canPost, signedIn, nudge }) {
  return (
    <>
      {experts.length > 0 && (
        <div className="mt-6 w-full text-left">
          <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">Experts worth following</p>
          <ul className="mt-1 divide-y divide-line">
            {experts.slice(0, 3).map((e) => <ExpertRow key={e.slug} e={e} signedIn={signedIn} />)}
          </ul>
          <Link href="/experts" className="mt-1 inline-block px-1 text-sm font-semibold text-brand hover:underline">See all experts</Link>
        </div>
      )}

      {canPost ? (
        <div className="mt-6 w-full rounded-2xl border border-dashed border-brand/40 bg-brand-soft/50 p-4 text-left">
          <p className="font-display text-base">{nudge ?? "Publish your first post"}</p>
          <p className="mt-0.5 text-sm text-muted">A lesson from your placement, a build you shipped or a question you're stuck on. It takes a minute.</p>
          <button type="button" onClick={openComposer} className="btn-primary mt-3 w-full cursor-pointer !rounded-full sm:w-auto">
            <Svg d="M12 5v14M5 12h14" size={16} />
            Create post
          </button>
        </div>
      ) : !signedIn ? (
        <Link href="/sign-up" className="btn-primary mt-6 w-full !rounded-full sm:w-auto">Join Buncho to post</Link>
      ) : null}
    </>
  );
}

function EmptyState({ empty, experts, canPost, signedIn }) {
  return (
    <div className="post-in card relative flex flex-col items-center overflow-hidden px-5 pb-6 pt-10 text-center sm:px-8">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-brand-soft to-transparent"
        aria-hidden="true"
      />
      <span className="relative flex h-16 w-16 items-center justify-center rounded-[28%] bg-surface text-brand shadow-sm ring-1 ring-line">
        <Svg d="M4 5h16v11H9l-5 4zM8 10h8" size={28} />
      </span>
      <p className="relative mt-4 font-display text-xl">{empty?.title ?? "Your feed is waiting for its first post"}</p>
      <p className="relative mx-auto mt-1.5 max-w-sm text-sm text-muted">
        {empty?.text ?? "Follow a few experts or share something you've learned. New posts show up here."}
      </p>
      {empty?.href && <Link href={empty.href} className="btn-outline relative mt-5 !rounded-full">{empty.cta}</Link>}
      <Prompts experts={experts} canPost={canPost} signedIn={signedIn} />
    </div>
  );
}

function ModeToggle({ mode, onChange }) {
  const btn = (value, label, d) => (
    <button
      type="button"
      onClick={() => onChange(value)}
      aria-pressed={mode === value}
      className={`inline-flex min-h-9 cursor-pointer items-center gap-1.5 rounded-full px-3.5 text-[13px] font-semibold transition-colors ${
        mode === value ? "bg-brand text-on-brand shadow-sm" : "text-muted hover:text-ink"
      }`}
    >
      <Svg d={d} size={15} />
      {label}
    </button>
  );

  return (
    <div className="flex items-center justify-between gap-3 md:hidden">
      <p className="min-w-0 truncate text-xs font-medium text-muted">
        {mode === "scroll" ? "One post at a time. Swipe up for the next." : "Latest posts"}
      </p>
      <div role="group" aria-label="Feed layout" className="flex shrink-0 rounded-full border border-line bg-surface p-0.5">
        {btn("list", "Traditional", "M4 6h16M4 12h16M4 18h16")}
        {btn("scroll", "Scroll", "M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM12 18h.01")}
      </div>
    </div>
  );
}

// Infinite scroll. Remount it (via `key`) when the filters change.
// editable: show an Edit button under each post (used for the "My posts" list).
// experts: suggested people to follow, used by the empty state. canPost: show the "create post" prompt.
export default function FeedList({ initial, filters, signedIn, empty, editable = false, experts = [], canPost = false }) {
  const [posts, setPosts] = useState(initial.posts);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("list");
  const [mobile, setMobile] = useState(false);
  const sentinel = useRef(null);
  const scroller = useRef(null);
  const busy = useRef(false);

  // "Scroll" is a phone layout. The choice is remembered on this device.
  const scrollMode = mode === "scroll" && mobile && !editable;

  useEffect(() => {
    try {
      if (localStorage.getItem(MODE_KEY) === "scroll") setMode("scroll");
    } catch {}
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  function changeMode(next) {
    setMode(next);
    try {
      localStorage.setItem(MODE_KEY, next);
    } catch {}
    if (next === "scroll") requestAnimationFrame(() => scroller.current?.scrollIntoView({ block: "start", behavior: "smooth" }));
  }

  // After router.refresh() (e.g. a new post was created) the server sends a fresh first page.
  // Add any posts we don't have yet at the top, and keep what has already been scrolled in.
  useEffect(() => {
    setPosts((prev) => {
      const fresh = initial.posts.filter((n) => !prev.some((x) => x.id === n.id));
      return fresh.length ? [...fresh, ...prev] : prev;
    });
  }, [initial]);

  useEffect(() => {
    if (!cursor || !sentinel.current) return;
    const io = new IntersectionObserver(
      async ([entry]) => {
        if (!entry.isIntersecting || busy.current) return;
        busy.current = true;
        setLoading(true);
        try {
          const next = await loadPosts({ ...filters, cursor });
          setPosts((p) => [...p, ...next.posts.filter((n) => !p.some((x) => x.id === n.id))]);
          setCursor(next.nextCursor);
        } finally {
          busy.current = false;
          setLoading(false);
        }
      },
      // In Scroll mode the posts scroll inside their own box, so watch that box instead of the page.
      { root: scrollMode ? scroller.current : null, rootMargin: "600px" }
    );
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [cursor, filters, scrollMode]);

  const onDeleted = (id) => setPosts((list) => list.filter((x) => x.id !== id));
  const onUpdated = (id, patch) => setPosts((list) => list.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  if (posts.length === 0) {
    return <EmptyState empty={empty} experts={experts} canPost={canPost} signedIn={signedIn} />;
  }

  const few = !cursor && !editable && posts.length < 4;

  const tail = cursor ? (
    <div ref={sentinel} className="space-y-2 py-2 sm:space-y-4" role="status" aria-label={loading ? "Loading more posts" : undefined}>
      {loading && (
        <>
          <PostSkeleton />
          {!scrollMode && <PostSkeleton />}
        </>
      )}
    </div>
  ) : few ? (
    <div className={`${CARD_EDGE} flex flex-col items-center px-5 py-7 text-center sm:px-8`}>
      <span className="flex h-11 w-11 items-center justify-center rounded-full bg-brand-soft text-brand">
        <Svg d="M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z" size={20} />
      </span>
      <p className="mt-3 font-display text-lg">It's quiet in here</p>
      <p className="mt-1 max-w-sm text-sm text-muted">Follow experts to fill your feed, or start the conversation yourself.</p>
      <Prompts experts={experts} canPost={canPost} signedIn={signedIn} nudge="Be the next voice in the feed" />
    </div>
  ) : (
    <div className="flex flex-col items-center gap-2 py-8 text-sm text-muted">
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-brand">
        <Svg d="M5 13l4 4L19 7" size={16} />
      </span>
      You're all caught up.
    </div>
  );

  return (
    <div className="space-y-3">
      {!editable && <ModeToggle mode={mode} onChange={changeMode} />}

      {scrollMode ? (
        <div
          ref={scroller}
          className="-mx-4 h-[calc(100dvh-15rem)] min-h-[26rem] scroll-mt-28 snap-y snap-proximity overflow-y-auto overscroll-contain"
        >
          {posts.map((p) => (
            <section key={p.id} className="flex min-h-full snap-start snap-always flex-col justify-center px-4 py-2">
              <PostCard post={p} signedIn={signedIn} onDeleted={onDeleted} focus />
            </section>
          ))}
          <div className="px-4">{tail}</div>
        </div>
      ) : (
        <div className="space-y-2 sm:space-y-4">
          {posts.map((p, i) => (
            <div key={p.id} className="post-in" style={{ "--i": Math.min(i % 10, 5) }}>
              {editable ? (
                <EditablePost post={p} signedIn={signedIn} onDeleted={onDeleted} onUpdated={onUpdated} />
              ) : (
                <PostCard post={p} signedIn={signedIn} onDeleted={onDeleted} />
              )}
            </div>
          ))}
          {tail}
        </div>
      )}
    </div>
  );
}
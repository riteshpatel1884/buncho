"use client";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import PostCard from "./PostCard";
import EditablePost from "./EditablePost";
import Avatar from "../Avatar";
import { BlueTick } from "../Badges";
import { showToast } from "../Toast";
import { loadPosts, toggleFollow } from "@/app/feed/actions";

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
        <Avatar name={e.name} src={e.avatarUrl} color={e.avatarColor} icon={e.avatarIcon} size={44} />
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

// Full-screen "reels" viewer. One post fills the screen. Swipe up for the next post, swipe down for the
// previous one. The browser's own scroll-snap does the swiping, so it feels native and keeps its momentum.
// It sits at z-60: above the navbar and tab bar, below the pop-ups (z-70 and up) a post can open.
function Reels({ posts, signedIn, onDeleted, onChange, onClose, onNearEnd, hasMore, loading }) {
  const rootRef = useRef(null);
  const scrollerRef = useRef(null);
  const raf = useRef(0);
  const [index, setIndex] = useState(0);

  // Opening zooms out: the screen starts slightly bigger and settles to normal size.
  useEffect(() => {
    const el = rootRef.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    el.animate(
      [{ transform: "scale(1.14)", opacity: 0 }, { transform: "scale(1)", opacity: 1 }],
      { duration: 320, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" }
    );
  }, []);

  // The page behind must not scroll while the viewer is open.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Keyboard: arrows / page keys move between posts, Esc closes. Ignored while typing or when a pop-up is open.
  useEffect(() => {
    const onKey = (e) => {
      const t = e.target;
      if (t?.closest?.("input, textarea, [contenteditable=true]")) return;
      if (document.querySelector('[role="dialog"], [role="alertdialog"]')) return;
      const el = scrollerRef.current;
      if (e.key === "Escape") return onClose(index);
      const dir = e.key === "ArrowDown" || e.key === "PageDown" ? 1 : e.key === "ArrowUp" || e.key === "PageUp" ? -1 : 0;
      if (!dir || !el) return;
      e.preventDefault();
      el.scrollBy({ top: dir * el.clientHeight, behavior: "smooth" });
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, index]);

  // Work out which post is on screen (used for the counter and for loading more).
  function onScroll() {
    if (raf.current) return;
    raf.current = requestAnimationFrame(() => {
      raf.current = 0;
      const el = scrollerRef.current;
      if (el && el.clientHeight) setIndex(Math.round(el.scrollTop / el.clientHeight));
    });
  }
  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  // Fetch the next page a few posts before the end so the swiping never stops.
  useEffect(() => {
    if (hasMore && index >= posts.length - 3) onNearEnd();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, posts.length, hasMore]);

  const shown = Math.min(index + 1, posts.length);

  return (
    <div ref={rootRef} role="region" aria-label="Posts, one at a time" className="fixed inset-0 z-[60] overflow-hidden bg-paper">
      {/* Top bar: close button on the left, position on the right. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-10 flex items-center justify-between px-3 pb-2 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button
          type="button"
          onClick={() => onClose(index)}
          aria-label="Close and go back to the feed"
          className="pointer-events-auto flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-line bg-surface/85 text-ink shadow-sm backdrop-blur"
        >
          <Svg d="M6 6l12 12M18 6L6 18" size={18} />
        </button>
        <span className="pointer-events-auto rounded-full border border-line bg-surface/85 px-3 py-1.5 text-xs font-semibold tabular-nums text-muted shadow-sm backdrop-blur">
          {shown} / {posts.length}{hasMore ? "+" : ""}
        </span>
      </div>

      <div
        ref={scrollerRef}
        onScroll={onScroll}
        className="h-full snap-y snap-mandatory overflow-y-auto overscroll-contain [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {posts.map((p, i) => (
          <section
            key={p.id}
            aria-label={`Post ${i + 1} of ${posts.length}`}
            className="flex h-full snap-start snap-always items-center justify-center px-3 pb-[max(1.25rem,env(safe-area-inset-bottom))] pt-[calc(max(0.75rem,env(safe-area-inset-top))+3.5rem)]"
          >
            <PostCard post={p} signedIn={signedIn} onDeleted={onDeleted} onChange={onChange} focus />
          </section>
        ))}

        {/* Last screen: either more posts are loading, or this is the end. */}
        <section className="flex h-full snap-start snap-always flex-col items-center justify-center gap-3 px-6 text-center text-sm text-muted">
          {hasMore || loading ? (
            <>
              <span className="h-7 w-7 animate-spin rounded-full border-2 border-line border-t-brand" aria-hidden="true" />
              Loading more posts…
            </>
          ) : (
            <>
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-surface-2 text-brand">
                <Svg d="M5 13l4 4L19 7" size={22} />
              </span>
              <p className="font-display text-lg text-ink">You're all caught up</p>
              <button type="button" onClick={() => onClose(index)} className="btn-outline mt-1 cursor-pointer !rounded-full">Back to feed</button>
            </>
          )}
        </section>
      </div>

      {/* Little hint on the first post only. */}
      {index === 0 && posts.length > 1 && (
        <div className="pointer-events-none absolute inset-x-0 bottom-[max(0.5rem,env(safe-area-inset-bottom))] z-10 flex flex-col items-center text-[11px] font-medium text-muted" aria-hidden="true">
          <span className="animate-bounce"><Svg d="M6 15l6-6 6 6" size={18} /></span>
          Swipe up for the next post
        </div>
      )}
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
  const [listKey, setListKey] = useState(0); // bumped when the viewer closes, so the list shows the latest like/save state
  const sentinel = useRef(null);
  const busy = useRef(false);

  // "Scroll" is a phone layout: the full-screen, one-post-at-a-time viewer.
  const scrollMode = mode === "scroll" && mobile && !editable;

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const sync = () => setMobile(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  // Tapping "Scroll" opens the full-screen viewer; closing it goes back to the normal list,
  // scrolled to the post that was last on screen.
  function changeMode(next) {
    setMode(next);
  }

  function closeReels(lastIndex) {
    const id = posts[Math.min(lastIndex ?? 0, posts.length - 1)]?.id;
    setMode("list");
    setListKey((k) => k + 1);
    if (id) setTimeout(() => document.getElementById(`feed-post-${id}`)?.scrollIntoView({ block: "center" }), 60);
  }

  // After router.refresh() (e.g. a new post was created) the server sends a fresh first page.
  // Add any posts we don't have yet at the top, and keep what has already been scrolled in.
  // (Only for the Latest sort, where new posts really belong at the top.)
  useEffect(() => {
    if (filters.sort && filters.sort !== "latest") return;
    setPosts((prev) => {
      const fresh = initial.posts.filter((n) => !prev.some((x) => x.id === n.id));
      return fresh.length ? [...fresh, ...prev] : prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial]);

  // Load the next page. Used by the normal list (when the bottom comes into view) and by the viewer.
  async function loadMore() {
    if (!cursor || busy.current) return;
    busy.current = true;
    setLoading(true);
    try {
      const next = await loadPosts({ ...filters, cursor });
      setPosts((p) => [...p, ...next.posts.filter((n) => !p.some((x) => x.id === n.id))]);
      setCursor(next.nextCursor);
    } catch {
      // Network hiccup: leave the cursor alone, the next scroll tries again.
    } finally {
      busy.current = false;
      setLoading(false);
    }
  }

  useEffect(() => {
    if (scrollMode || !cursor || !sentinel.current) return;
    const io = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && loadMore(),
      { root: null, rootMargin: "600px" }
    );
    io.observe(sentinel.current);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor, filters, scrollMode]);

  const onDeleted = (id) => setPosts((list) => list.filter((x) => x.id !== id));
  const onUpdated = (id, patch) => setPosts((list) => list.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  // A card reports its new state (like, save, follow, comment count) so nothing goes stale between the two views.
  const onCardChange = useCallback((np) => setPosts((list) => list.map((x) => (x.id === np.id ? { ...x, ...np } : x))), []);

  if (posts.length === 0) {
    return <EmptyState empty={empty} experts={experts} canPost={canPost} signedIn={signedIn} />;
  }

  // The feed isn't empty here (an empty feed shows EmptyState above), so the end is a clear
  // "caught up" divider. When there are only a few posts, suggestions follow under it.
  const few = !cursor && !editable && posts.length < 4;

  const caughtUp = (
    <div className="flex items-center gap-3 py-6 text-xs font-medium text-muted" role="status">
      <span className="h-px flex-1 bg-line" />
      <span className="inline-flex items-center gap-1.5"><Svg d="M5 13l4 4L19 7" size={14} />You're all caught up</span>
      <span className="h-px flex-1 bg-line" />
    </div>
  );

  const tail = cursor ? (
    <div ref={sentinel} className="space-y-2 py-2 sm:space-y-4" role="status" aria-label={loading ? "Loading more posts" : undefined}>
      {loading && (
        <>
          <PostSkeleton />
          <PostSkeleton />
        </>
      )}
    </div>
  ) : (
    <>
      {caughtUp}
      {few && (
        <div className={`${CARD_EDGE} px-5 py-6 sm:px-8`}>
          <p className="font-display text-lg">Want more to read?</p>
          <p className="mt-1 max-w-sm text-sm text-muted">Follow a few experts to see their posts here, or share something yourself.</p>
          <Prompts experts={experts} canPost={canPost} signedIn={signedIn} nudge="Be the next voice in the feed" />
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-3">
      {!editable && <ModeToggle mode={mode} onChange={changeMode} />}

      {/* The normal list stays mounted behind the full-screen viewer, so closing it puts you back where you were. */}
      <div key={listKey} className="space-y-2 sm:space-y-4">
        {posts.map((p, i) => (
          <div key={p.id} id={`feed-post-${p.id}`} className="post-in scroll-mt-32" style={{ "--i": Math.min(i % 10, 5) }}>
            {editable ? (
              <EditablePost post={p} signedIn={signedIn} onDeleted={onDeleted} onUpdated={onUpdated} />
            ) : (
              <PostCard post={p} signedIn={signedIn} onDeleted={onDeleted} onChange={onCardChange} />
            )}
          </div>
        ))}
        {tail}
      </div>

      {scrollMode &&
        createPortal(
          <Reels
            posts={posts}
            signedIn={signedIn}
            onDeleted={onDeleted}
            onChange={onCardChange}
            onClose={closeReels}
            onNearEnd={loadMore}
            hasMore={!!cursor}
            loading={loading}
          />,
          document.body
        )}
    </div>
  );
}
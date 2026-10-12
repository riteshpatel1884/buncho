"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import PostCard from "./PostCard";
import EditablePost from "./EditablePost";
import { loadPosts } from "@/app/feed/actions";

function PostSkeleton() {
  return (
    <div className="card space-y-4 p-5" aria-hidden="true">
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
        <div className="skeleton h-8 w-16 !rounded-full" />
        <div className="skeleton h-8 w-16 !rounded-full" />
        <div className="skeleton h-8 w-16 !rounded-full" />
      </div>
    </div>
  );
}

// Infinite scroll. Remount it (via `key`) when the filters change.
// editable: show an Edit button under each post (used for the "My posts" list).
export default function FeedList({ initial, filters, signedIn, empty, editable = false }) {
  const [posts, setPosts] = useState(initial.posts);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef(null);
  const busy = useRef(false);

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
      { rootMargin: "600px" }
    );
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [cursor, filters]);

  const onDeleted = (id) => setPosts((list) => list.filter((x) => x.id !== id));
  const onUpdated = (id, patch) => setPosts((list) => list.map((x) => (x.id === id ? { ...x, ...patch } : x)));

  if (posts.length === 0) {
    return (
      <div className="post-in card flex flex-col items-center px-6 py-14 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 5h16v11H9l-5 4zM8 10h8" />
          </svg>
        </span>
        <p className="mt-4 font-display text-xl">{empty?.title ?? "Nothing here yet."}</p>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted">{empty?.text ?? "Check back soon. New posts are shared every week."}</p>
        {empty?.href && <Link href={empty.href} className="btn-primary mt-5 !rounded-full">{empty.cta}</Link>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((p, i) => (
        <div key={p.id} className="post-in" style={{ "--i": Math.min(i % 10, 5) }}>
          {editable ? (
            <EditablePost post={p} signedIn={signedIn} onDeleted={onDeleted} onUpdated={onUpdated} />
          ) : (
            <PostCard post={p} signedIn={signedIn} onDeleted={onDeleted} />
          )}
        </div>
      ))}

      {cursor ? (
        <div ref={sentinel} className="space-y-4 py-2" role="status" aria-label={loading ? "Loading more posts" : undefined}>
          {loading && (
            <>
              <PostSkeleton />
              <PostSkeleton />
            </>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2 py-8 text-sm text-muted">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-2 text-brand">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M5 13l4 4L19 7" /></svg>
          </span>
          You're all caught up.
        </div>
      )}
    </div>
  );
}
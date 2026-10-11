"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import PostCard from "./PostCard";
import Spinner from "../Spinner";
import { loadPosts } from "@/app/feed/actions";

// Infinite scroll. Remount it (via `key`) when the filters change.
export default function FeedList({ initial, filters, signedIn, empty }) {
  const [posts, setPosts] = useState(initial.posts);
  const [cursor, setCursor] = useState(initial.nextCursor);
  const [loading, setLoading] = useState(false);
  const sentinel = useRef(null);
  const busy = useRef(false);

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
      { rootMargin: "500px" }
    );
    io.observe(sentinel.current);
    return () => io.disconnect();
  }, [cursor, filters]);

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-line p-10 text-center">
        <p className="font-display text-xl">{empty?.title ?? "Nothing here yet."}</p>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">{empty?.text ?? "Check back soon. Experts are sharing new advice every week."}</p>
        {empty?.href && <Link href={empty.href} className="btn-primary mt-5">{empty.cta}</Link>}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((p) => <PostCard key={p.id} post={p} signedIn={signedIn} />)}
      {cursor ? (
        <div ref={sentinel} className="flex justify-center py-6 text-brand">{loading && <Spinner className="h-6 w-6" />}</div>
      ) : (
        <p className="py-6 text-center text-sm text-muted">You're all caught up.</p>
      )}
    </div>
  );
}
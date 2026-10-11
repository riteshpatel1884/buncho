"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleFollow } from "@/app/feed/actions";

// Follower count with a Follow button. Hide the button on your own profile with `mine`.
export default function FollowBar({ authorId, initialFollowing, initialCount, signedIn, mine, returnTo }) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  function onClick() {
    setError("");
    const was = following;
    setFollowing(!was);
    setCount((c) => c + (was ? -1 : 1));
    startTransition(async () => {
      const res = await toggleFollow(authorId);
      if (res?.error) {
        setFollowing(was);
        setCount((c) => c + (was ? 1 : -1));
        setError(res.error);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center gap-3 pt-1">
      <p className="text-sm text-muted">
        <b className="text-ink">{count}</b> {count === 1 ? "follower" : "followers"}
      </p>
      {!mine &&
        (signedIn ? (
          <button type="button" onClick={onClick} className={`cursor-pointer ${following ? "btn-outline" : "btn-primary"} !px-4 !py-1.5`}>
            {following ? "Following" : "Follow"}
          </button>
        ) : (
          <Link href={`/sign-in?redirect_url=${encodeURIComponent(returnTo)}`} className="btn-primary !px-4 !py-1.5">Follow</Link>
        ))}
      {error && <span role="alert" className="text-xs text-danger">{error}</span>}
    </div>
  );
}
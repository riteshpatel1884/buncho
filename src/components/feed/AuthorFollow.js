"use client";
import { useState, useTransition } from "react";
import Link from "next/link";
import { toggleFollow } from "@/app/feed/actions";

// Counts line and Follow button for the author card on a post page.
// Works for signed-out visitors too: the button then sends them to sign in and brings them back here.
export default function AuthorFollow({ authorId, initialFollowing, initialFollowers, posts, following, signedIn, mine, canFollow, returnTo }) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [followers, setFollowers] = useState(initialFollowers);
  const [error, setError] = useState("");
  const [, startTransition] = useTransition();

  function onClick() {
    setError("");
    const was = isFollowing;
    setIsFollowing(!was);
    setFollowers((c) => c + (was ? -1 : 1));
    startTransition(async () => {
      const res = await toggleFollow(authorId);
      if (res?.error) {
        setIsFollowing(was);
        setFollowers((c) => c + (was ? 1 : -1));
        setError(res.error);
      }
    });
  }

  return (
    <>
      <p className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
        <span><b className="text-ink">{posts}</b> {posts === 1 ? "Post" : "Posts"}</span>
        <span><b className="text-ink">{following}</b> Following</span>
        <span><b className="text-ink">{followers}</b> {followers === 1 ? "Follower" : "Followers"}</span>
      </p>

      {canFollow && !mine && (
        signedIn ? (
          <button type="button" onClick={onClick} className={`mt-4 w-full cursor-pointer ${isFollowing ? "btn-outline" : "btn-primary"} !rounded-full !py-2`}>
            {isFollowing ? "Following" : "Follow"}
          </button>
        ) : (
          <Link href={`/sign-in?redirect_url=${encodeURIComponent(returnTo)}`} className="btn-primary mt-4 w-full !rounded-full !py-2">Follow</Link>
        )
      )}
      {error && <p role="alert" className="mt-2 text-xs text-danger">{error}</p>}
    </>
  );
}

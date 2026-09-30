"use client";
import { useState, useTransition } from "react";

export default function VoteButton({ productId, initialCount, initialVoted }) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [pending, startTransition] = useTransition();

  function toggle(e) {
    e.preventDefault();
    // optimistic update
    setVoted(!voted);
    setCount(count + (voted ? -1 : 1));
    startTransition(async () => {
      const res = await fetch("/api/votes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });
      if (res.status === 401) {
        window.location.href = "/sign-in";
        return;
      }
      if (!res.ok) {
        setVoted(voted);
        setCount(count);
        return;
      }
      const data = await res.json();
      setVoted(data.voted);
      setCount(data.count);
    });
  }

  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-pressed={voted}
      aria-label={voted ? "Remove upvote" : "Upvote"}
      className={`flex w-14 flex-col items-center rounded-lg border px-2 py-1.5 text-sm font-semibold ${
        voted ? "border-accent bg-accent text-white" : "border-line bg-white hover:border-accent"
      }`}
    >
      <span aria-hidden>▲</span>
      {count}
    </button>
  );
}

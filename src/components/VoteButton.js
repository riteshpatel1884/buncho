"use client";
import { useState, useTransition } from "react";

export default function VoteButton({ productId, initialCount, initialVoted, size = "sm" }) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(initialVoted);
  const [pending, startTransition] = useTransition();
  const [burst, setBurst] = useState(0);

  function toggle(e) {
    e.preventDefault();
    if (!voted) setBurst(Date.now());
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

  const big = size === "lg";
  return (
    <button
      onClick={toggle}
      disabled={pending}
      aria-pressed={voted}
      aria-label={voted ? "Remove upvote" : "Upvote"}
      className={`relative flex flex-col items-center rounded-xl border font-semibold transition-colors ${
        big ? "w-20 gap-1 py-3 text-lg" : "w-14 gap-0.5 py-2 text-sm"
      } ${
        voted
          ? "border-brand bg-brand text-on-brand"
          : "border-line bg-surface text-ink hover:border-brand hover:text-brand"
      }`}
    >
      <svg width={big ? 18 : 14} height={big ? 18 : 14} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className={voted ? "anim-pop" : ""}>
        <path d="M8 3l6 8H2l6-8z" />
      </svg>
      <span key={count} className="anim-tick">{count}</span>
      {burst > 0 && (
        <span key={burst} className="burst" aria-hidden="true">
          {Array.from({ length: 8 }).map((_, k) => (
            <i key={k} style={{ "--a": `${k * 45}deg` }} />
          ))}
        </span>
      )}
    </button>
  );
}
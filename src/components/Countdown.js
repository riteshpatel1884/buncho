"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// Live countdown to the end of today's Daily Pick. Refreshes the page when it reaches zero.
export default function Countdown({ endsAt }) {
  const router = useRouter();
  const [left, setLeft] = useState(null);

  useEffect(() => {
    const end = new Date(endsAt).getTime();
    let done = false;
    const tick = () => {
      const ms = Math.max(0, end - Date.now());
      setLeft(ms);
      if (ms === 0 && !done) {
        done = true;
        router.refresh();
      }
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [endsAt, router]);

  if (left === null) return <span className="tabular-nums">--:--:--</span>;
  const s = Math.floor(left / 1000);
  const pad = (n) => String(n).padStart(2, "0");
  return <span className="tabular-nums">{pad(Math.floor(s / 3600))}:{pad(Math.floor((s % 3600) / 60))}:{pad(s % 60)}</span>;
}
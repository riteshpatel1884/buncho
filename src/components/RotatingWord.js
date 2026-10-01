"use client";
import { useEffect, useState } from "react";

// Cycles through words with a slide-and-fade. Words share one grid cell so the width never jumps.
export default function RotatingWord({ words, interval = 2600 }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const t = setInterval(() => setI((x) => (x + 1) % words.length), interval);
    return () => clearInterval(t);
  }, [words.length, interval]);

  const n = words.length;
  return (
    <span className="inline-grid h-[1.2em] overflow-hidden align-bottom">
      {words.map((w, idx) => {
        const d = (idx - i + n) % n;
        const y = d === 0 ? 0 : d === 1 ? 100 : -100;
        return (
          <span
            key={w}
            aria-hidden={d !== 0}
            className="text-shimmer col-start-1 row-start-1 transition-all duration-500 ease-out"
            style={{ transform: `translateY(${y}%)`, opacity: d === 0 ? 1 : 0 }}
          >
            {w}.
          </span>
        );
      })}
    </span>
  );
}
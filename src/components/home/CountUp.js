'use client';

import { useEffect, useRef, useState } from 'react';

// Counts up to `value` the first time it scrolls into view.
// Server render shows the final number, so SEO and no-JS users see the real value.
export default function CountUp({ value, suffix = '', duration = 1400 }) {
  const ref = useRef(null);
  const [n, setN] = useState(value);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const el = ref.current;
    if (!el || !('IntersectionObserver' in window)) return;

    let raf;
    setN(0);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const frame = (now) => {
          const p = Math.min(1, (now - start) / duration);
          setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) raf = requestAnimationFrame(frame);
        };
        raf = requestAnimationFrame(frame);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [value, duration]);

  return (
    <span ref={ref} className="tabular-nums">
      {n}
      {suffix}
    </span>
  );
}
'use client';

import { useEffect, useRef } from 'react';

/** Horizontal scroller that glides to the element marked data-current="true" once the page has loaded. */
export default function ScrollToCurrent({ children, className = '' }) {
  const ref = useRef(null);

  useEffect(() => {
    const box = ref.current;
    const current = box?.querySelector('[data-current="true"]');
    if (!box || !current) return undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(
      () => {
        const left = current.offsetLeft - box.clientWidth / 2 + current.offsetWidth / 2;
        box.scrollTo({ left: Math.max(0, left), behavior: reduce ? 'auto' : 'smooth' });
      },
      reduce ? 0 : 500,
    );
    return () => clearTimeout(timer);
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
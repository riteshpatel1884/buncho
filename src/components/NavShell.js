'use client';

import { useEffect, useState } from 'react';

/**
 * Sticky navbar wrapper. A floating, fully rounded pill, never full width.
 * - At the top of the page: a medium pill.
 * - Scrolling down: shrinks into a smaller, tighter pill.
 * - Scrolling up (or back at the top): expands again.
 * The outer wrapper keeps a fixed height, so the page never jumps when the bar changes size.
 * `premium` gives active Pro users a gold look.
 */
export default function NavShell({ children, premium = false }) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      const dy = y - last;
      if (y <= 8) setCompact(false);
      else if (dy > 6) setCompact(true);
      else if (dy < -6) setCompact(false);
      if (Math.abs(dy) > 6 || y <= 8) last = y;
      ticking = false;
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(update);
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    update();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const size = compact
    ? 'mt-2 h-12 w-[calc(100%-1.5rem)] max-w-[60rem] rounded-full shadow-lg'
    : 'mt-2 h-14 w-[calc(100%-1.5rem)] max-w-[76rem] rounded-full shadow-md';

  const look = premium
    ? 'border-amber-400/60 bg-gradient-to-r from-amber-50/95 via-yellow-100/90 to-amber-50/95 shadow-amber-500/25 dark:border-amber-400/40 dark:from-[#2b210a]/95 dark:via-[#3b2d08]/92 dark:to-[#2b210a]/95 dark:shadow-amber-500/20'
    : compact
      ? 'border-line bg-surface/85 shadow-black/15'
      : 'border-line bg-surface/90 shadow-black/5';

  return (
    <div className="sticky top-0 z-50 h-16">
      <header
        data-compact={compact}
        data-premium={premium || undefined}
        className={`group/nav relative mx-auto border backdrop-blur-md transition-all duration-300 ease-out ${size} ${look}`}
      >
        {premium && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent"
          />
        )}
        {children}
      </header>
    </div>
  );
}
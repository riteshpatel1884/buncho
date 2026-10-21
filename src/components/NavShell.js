'use client';

import { useEffect, useState } from 'react';

/**
 * Sticky navbar wrapper. A floating, fully rounded pill, never full width.
 * - At the top of the page: a medium pill.
 * - Scrolling down: shrinks into a smaller, tighter pill.
 * - Scrolling up (or back at the top): expands again.
 * The outer wrapper keeps a fixed height, so the page never jumps when the bar changes size.
 */
export default function NavShell({ children }) {
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

  return (
    <div className="sticky top-0 z-50 h-14">
      <header
        data-compact={compact}
        className={`group/nav relative mx-auto border border-line backdrop-blur-md transition-all duration-300 ease-out ${
          compact
            ? 'mt-2 h-10 w-[calc(100%-1.5rem)] max-w-[60rem] rounded-full bg-surface/85 shadow-lg shadow-black/15'
            : 'mt-2 h-12 w-[calc(100%-1.5rem)] max-w-[76rem] rounded-full bg-surface/90 shadow-md shadow-black/5'
        }`}
      >
        {children}
      </header>
    </div>
  );
}
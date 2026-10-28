'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

// Phone-only call to action pinned to the bottom of the screen.
// Appears after the hero scrolls away and hides again near the page end (where the big CTA is).
export default function StickyCta({ href, label }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    let ticking = false;
    const update = () => {
      const y = window.scrollY;
      const remaining = document.documentElement.scrollHeight - (y + window.innerHeight);
      setShow(y > window.innerHeight * 0.8 && remaining > 900);
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
    <div
      aria-hidden={!show}
      className={`fixed inset-x-0 bottom-0 z-40 bg-gradient-to-t from-bg via-bg/85 to-transparent px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-8 transition-all duration-300 md:hidden ${
        show ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-full opacity-0'
      }`}
    >
      <Link
        href={href}
        tabIndex={show ? 0 : -1}
        className="flex h-12 items-center justify-center rounded-xl bg-accent font-semibold text-accent-ink shadow-lg shadow-accent/30 active:scale-[0.98]"
      >
        {label}
      </Link>
    </div>
  );
}
"use client";
import { useEffect, useState } from "react";

// Floating pill navbar. Shrinks when you scroll down, expands when you scroll up or return to the top.
export default function NavShell({ children }) {
  const [compact, setCompact] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    function update() {
      raf = 0;
      const y = window.scrollY;
      if (y <= 12) setCompact(false);
      else if (y > last + 4) setCompact(true);
      else if (y < last - 4) setCompact(false);
      last = y;
    }
    function onScroll() {
      if (!raf) raf = requestAnimationFrame(update);
    }
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header className="sticky top-0 z-40 h-[4.75rem] px-3 pt-3 sm:px-4">
      <nav
        data-compact={compact}
        className={`relative mx-auto flex items-center justify-between gap-3 rounded-full border border-line bg-surface/80 px-4 backdrop-blur-xl transition-[max-width,width,height,box-shadow] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:px-5 ${
          compact
            ? "h-12 w-[88%] max-w-4xl shadow-[0_8px_30px_rgba(0,0,0,0.12)] sm:w-full"
            : "h-16 w-full max-w-6xl shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
        }`}
      >
        {children}
      </nav>
    </header>
  );
}
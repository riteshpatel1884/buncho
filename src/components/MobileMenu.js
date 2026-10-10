"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

// Hamburger menu for screens below the md breakpoint. Links are passed in as children.
export default function MobileMenu({ children }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className="cursor-pointer flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface-2"
      >
        <span className="relative block h-3.5 w-5">
          <span className={`absolute left-0 top-0 h-0.5 w-5 rounded bg-ink transition-transform duration-300 ${open ? "translate-y-[6px] rotate-45" : ""}`} />
          <span className={`absolute left-0 top-[6px] h-0.5 w-5 rounded bg-ink transition-opacity duration-200 ${open ? "opacity-0" : ""}`} />
          <span className={`absolute left-0 top-3 h-0.5 w-5 rounded bg-ink transition-transform duration-300 ${open ? "-translate-y-[6px] -rotate-45" : ""}`} />
        </span>
      </button>
      {open && (
        <div
          className="page-in absolute inset-x-0 top-full mt-2 rounded-2xl border border-line bg-surface px-3 py-2 shadow-2xl"
          onClick={(e) => e.target.closest("a") && setOpen(false)}
        >
          {children}
        </div>
      )}
    </div>
  );
}
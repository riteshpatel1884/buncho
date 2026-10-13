"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// A "Filter" button that opens a small pop-up menu of topics, with a tick on the one in use.
// options: [{ key, label, href }]. Choosing one is a normal link, so the server page re-renders the feed.
export default function FeedFilter({ options, active = "" }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const current = options.find((o) => o.key === active) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const away = (e) => !ref.current?.contains(e.target) && setOpen(false);
    const key = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("keydown", key);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className={`inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-sm font-medium transition-colors ${
          active ? "border-brand bg-brand-soft text-brand" : "border-line bg-surface text-muted hover:border-brand hover:text-ink"
        }`}
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M3 5h18l-7 8v6l-4 2v-8z" /></svg>
        {active ? current.label : "Filter"}
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`transition-transform ${open ? "rotate-180" : ""}`}><path d="M6 9l6 6 6-6" /></svg>
      </button>

      {open && (
        <div role="menu" aria-label="Filter by topic" className="expand-in absolute right-0 top-11 z-40 w-60 overflow-hidden rounded-2xl border border-line bg-surface py-1.5 shadow-2xl">
          <p className="px-4 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Topic</p>
          {options.map((o) => {
            const on = o.key === (active || "");
            return (
              <Link
                key={o.key || "all"}
                href={o.href}
                role="menuitemradio"
                aria-checked={on}
                onClick={() => setOpen(false)}
                className={`flex items-center justify-between gap-3 px-4 py-3 text-[15px] transition-colors hover:bg-surface-2 ${on ? "font-semibold text-ink" : "text-muted"}`}
              >
                {o.label}
                {on && (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-brand"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
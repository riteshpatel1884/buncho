"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// A "Your stats" button that opens the numbers in a pop-up: a bottom sheet on phones, a centred card on tablets.
// The server page passes the stats in as children, so they stay server-rendered.
export default function StatsPopup({ summary, children }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="card flex w-full cursor-pointer items-center gap-3 p-4 text-left transition-colors hover:border-brand"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
          </svg>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-base">Your stats</span>
          <span className="block truncate text-xs text-muted">{summary}</span>
        </span>
        <svg className="shrink-0 text-muted" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M9 6l6 6-6 6" /></svg>
      </button>

      {mounted && open && createPortal(
        <div
          className="modal-backdrop fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-[2px] sm:items-center sm:p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Your stats"
            className="modal-panel flex max-h-[88vh] w-full flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-2xl sm:max-w-md sm:rounded-3xl"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-3">
              <p className="font-display text-lg">Your stats</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="cursor-pointer rounded-full p-1.5 text-muted transition-colors hover:bg-surface-2 hover:text-ink">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
            <div className="overflow-y-auto p-5 pb-8">{children}</div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
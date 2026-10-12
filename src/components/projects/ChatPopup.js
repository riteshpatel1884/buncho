"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// A button that opens a chat pop-up. The server page passes the header, the messages (children)
// and the footer (composer and warning) in, so server actions and forms keep working inside it.
export default function ChatPopup({ label = "Open chat", count = 0, header, footer, children }) {
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
      <button type="button" onClick={() => setOpen(true)} className="btn-primary shrink-0 cursor-pointer">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 5h16v11H9l-5 4zM8 10h8" />
        </svg>
        {label}
        {count > 0 && (
          <span className="rounded-full bg-on-brand/20 px-2 py-0.5 text-xs font-bold">{count}</span>
        )}
      </button>

      {mounted && open && createPortal(
        <div
          className="modal-backdrop fixed inset-0 z-[70] flex items-end justify-center bg-black/50 sm:items-center sm:p-4"
          onMouseDown={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Chat"
            className="modal-panel flex h-[92vh] w-full flex-col overflow-hidden rounded-t-2xl border border-line bg-surface shadow-2xl sm:h-[85vh] sm:max-w-2xl sm:rounded-2xl"
          >
            <div className="flex items-start justify-between gap-3 border-b border-line bg-surface px-4 py-3">
              <div className="min-w-0 flex-1">{header}</div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close chat"
                className="cursor-pointer rounded-lg p-1 text-muted hover:text-ink"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>

            {/* Messages: the page renders this list and it fills the space */}
            {children}

            {/* Composer and warning stay at the bottom */}
            <div className="max-h-[50%] shrink-0 space-y-3 overflow-y-auto border-t border-line bg-surface p-3">{footer}</div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
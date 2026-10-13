"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { usePathname } from "next/navigation";
import NotificationRow from "./NotificationRow";
import { getUnreadCount, loadNotifications, markAllRead } from "@/app/notifications/actions";

// The bell in the navbar: unread count on the button, the latest notifications in a drop-down.
// The panel is drawn in document.body because the navbar's blur effect would otherwise trap fixed positioning.
export default function NotificationBell({ initialCount = 0 }) {
  const [count, setCount] = useState(initialCount);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState(null);
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef(null);
  const panelRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  const refresh = useCallback(async () => {
    try { setCount(await getUnreadCount()); } catch {}
  }, []);

  // Keep the number fresh: when you move around the site, come back to the tab, and every minute.
  useEffect(() => { refresh(); }, [pathname, refresh]);
  useEffect(() => {
    const tick = () => document.visibilityState === "visible" && refresh();
    const id = setInterval(tick, 60000);
    document.addEventListener("visibilitychange", tick);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", tick); };
  }, [refresh]);

  // Opening loads the list, then marks everything read. The rows keep their "new" tint until you close it.
  async function toggle() {
    const next = !open;
    setOpen(next);
    if (!next) return;
    setItems(null);
    try {
      setItems(await loadNotifications(12));
      if (count > 0) { setCount(0); await markAllRead(); }
    } catch {
      setItems([]);
    }
  }

  useEffect(() => {
    if (!open) return;
    const away = (e) => {
      if (btnRef.current?.contains(e.target) || panelRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const key = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", away);
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("mousedown", away); document.removeEventListener("keydown", key); };
  }, [open]);

  // Going to another page closes it.
  useEffect(() => setOpen(false), [pathname]);

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-label={count > 0 ? `Notifications, ${count} unread` : "Notifications"}
        aria-haspopup="dialog"
        aria-expanded={open}
        className="relative flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-2 hover:text-ink"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8zM10 20a2 2 0 0 0 4 0" />
        </svg>
        {count > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[10px] font-bold leading-none text-on-brand ring-2 ring-surface">
            {count > 9 ? "9+" : count}
          </span>
        )}
      </button>

      {mounted && open && createPortal(
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
          className="expand-in fixed right-3 top-[4.75rem] z-50 flex max-h-[min(34rem,calc(100dvh-6rem))] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-line bg-surface shadow-2xl"
        >
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="font-display text-base">Notifications</p>
            <Link href="/notifications" onClick={() => setOpen(false)} className="text-xs font-semibold text-brand hover:underline">See all</Link>
          </div>
          <div className="overflow-y-auto overscroll-contain">
            {items === null ? (
              <p className="px-4 py-8 text-center text-sm text-muted">Loading…</p>
            ) : items.length === 0 ? (
              <div className="px-6 py-10 text-center">
                <p className="font-display text-base">Nothing yet</p>
                <p className="mt-1 text-sm text-muted">Follows, likes, comments and mentions will show up here.</p>
              </div>
            ) : (
              <ul className="divide-y divide-line">
                {items.map((n) => <NotificationRow key={n.id} n={n} onNavigate={() => setOpen(false)} />)}
              </ul>
            )}
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
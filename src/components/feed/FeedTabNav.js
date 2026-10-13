"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

// The feed tabs. On For you / Following / Saved, tapping the tab opens a small sort menu
// (Latest, Oldest, Most popular). Tapping a different tab switches to it and opens its menu too.
// tabs: [{ key, label, href, icon, sortable, options: [{ key, label, href }] }]
// variant: "bar" = the sticky phone/tablet bar, "side" = the desktop sidebar list.
export default function FeedTabNav({ tabs, active, sort = "latest", variant = "bar" }) {
  const [openKey, setOpenKey] = useState(null);
  const ref = useRef(null);

  useEffect(() => {
    if (!openKey) return;
    const away = (e) => !ref.current?.contains(e.target) && setOpenKey(null);
    const key = (e) => e.key === "Escape" && setOpenKey(null);
    document.addEventListener("mousedown", away);
    document.addEventListener("touchstart", away, { passive: true });
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("mousedown", away);
      document.removeEventListener("touchstart", away);
      document.removeEventListener("keydown", key);
    };
  }, [openKey]);

  function onTabClick(e, t) {
    if (!t.sortable) return setOpenKey(null);
    // Already on this tab: don't reload, just show or hide the menu.
    if (t.key === active) {
      e.preventDefault();
      return setOpenKey((k) => (k === t.key ? null : t.key));
    }
    // Different tab: let the link switch tabs and open the menu on it.
    setOpenKey(t.key);
  }

  const bar = variant === "bar";
  const last = tabs.length - 1;

  return (
    <nav ref={ref} aria-label="Feed" className={bar ? "flex" : "space-y-0.5"}>
      {tabs.map((t, i) => {
        const on = active === t.key;
        const open = openKey === t.key;
        const menuPos = bar
          ? i === 0 ? "left-1" : i === last ? "right-1" : "left-1/2 -translate-x-1/2"
          : "inset-x-2";

        return (
          <div key={t.key} className={`relative ${bar ? "min-w-0 flex-1" : ""}`}>
            <Link
              href={t.href}
              onClick={(e) => onTabClick(e, t)}
              aria-current={on ? "page" : undefined}
              aria-haspopup={t.sortable ? "menu" : undefined}
              aria-expanded={t.sortable ? open : undefined}
              className={
                bar
                  ? `relative flex items-center justify-center gap-1 px-1 py-3 text-sm font-semibold transition-colors ${on ? "text-ink" : "text-muted hover:text-ink"}`
                  : `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${on ? "bg-brand-soft text-brand" : "text-muted hover:bg-surface-2 hover:text-ink"}`
              }
            >
              {!bar && t.icon && (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={t.icon} /></svg>
              )}
              <span className={bar ? "min-w-0 truncate" : "min-w-0 flex-1 truncate"}>{t.label}</span>
              {t.sortable && (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`shrink-0 transition-transform ${open ? "rotate-180" : ""}`}>
                  <path d="M6 9l6 6 6-6" />
                </svg>
              )}
              {bar && on && <span className="absolute inset-x-1/2 bottom-0 h-1 w-10 -translate-x-1/2 rounded-full bg-brand" aria-hidden="true" />}
            </Link>

            {t.sortable && open && (
              <div role="menu" aria-label="Sort posts" className={`expand-in absolute top-full z-50 mt-1 overflow-hidden rounded-2xl border border-line bg-surface py-1.5 shadow-2xl ${bar ? "w-48" : ""} ${menuPos}`}>
                <p className="px-4 pb-1 pt-1.5 text-xs font-semibold uppercase tracking-wide text-muted">Sort by</p>
                {t.options.map((o) => {
                  const picked = o.key === sort;
                  return (
                    <Link
                      key={o.key}
                      href={o.href}
                      role="menuitemradio"
                      aria-checked={picked}
                      onClick={() => setOpenKey(null)}
                      className={`flex items-center justify-between gap-3 px-4 py-3 text-[15px] transition-colors hover:bg-surface-2 ${picked ? "font-semibold text-ink" : "text-muted"}`}
                    >
                      {o.label}
                      {picked && (
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="text-brand"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
}
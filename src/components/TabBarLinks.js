"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ICONS = {
  home: "M3 11l9-8 9 8M5 10v10h5v-6h4v6h5V10",
  search: "M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3",
  list: "M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01",
  user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
  grid: "M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z",
  login: "M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3",
  spark: "M12 3l2.2 5.8L20 11l-5.8 2.2L12 19l-2.2-5.8L4 11l5.8-2.2z",
};

export default function TabBarLinks({ items }) {
  const pathname = usePathname();
  const isActive = (href) => (href === "/" || href === "/dashboard" ? pathname === href : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-3 bottom-3 z-40 rounded-2xl border border-line bg-surface/90 shadow-[0_8px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl md:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="grid" style={{ gridTemplateColumns: `repeat(${items.length}, minmax(0, 1fr))` }}>
        {items.map((it) => {
          const active = isActive(it.href);
          return (
            <li key={it.href + it.label}>
              <Link href={it.href} aria-current={active ? "page" : undefined} className="flex flex-col items-center gap-0.5 px-1 py-2 text-[11px] font-medium">
                <span className={`flex h-8 w-12 items-center justify-center rounded-full transition-colors ${active ? "bg-brand-soft text-brand" : "text-muted"}`}>
                  <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d={ICONS[it.icon]} />
                  </svg>
                </span>
                <span className={active ? "text-brand" : "text-muted"}>{it.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
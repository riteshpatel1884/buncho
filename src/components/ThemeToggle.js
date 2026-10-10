"use client";
import { useTheme } from "@/lib/useTheme";

// Switches between the dark (default) and light theme and remembers the choice.
export default function ThemeToggle() {
  const theme = useTheme();
  const dark = theme === "dark";

  function toggle() {
    const root = document.documentElement;
    const next = dark ? "light" : "dark";
    root.classList.add("theme-anim");
    root.dataset.theme = next;
    try { localStorage.setItem("theme", next); } catch {}
    setTimeout(() => root.classList.remove("theme-anim"), 400);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light theme" : "Switch to dark theme"}
      title={dark ? "Light theme" : "Dark theme"}
      className="cursor-pointer flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-line bg-surface-2 text-ink transition-colors hover:border-brand"
    >
      <span key={theme} className="icon-turn flex">
        {dark ? (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
          </svg>
        ) : (
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
          </svg>
        )}
      </span>
    </button>
  );
}

'use client';

import { Moon, Sun } from './icons';

// The icon swap is pure CSS (dark: variants), so there is no hydration mismatch.
// premium: soft gold tint for Pro members, matching the navbar.
export default function ThemeToggle({ premium = false }) {
  function toggle() {
    const root = document.documentElement;
    const next = root.classList.contains('dark') ? 'light' : 'dark';
    root.classList.toggle('dark', next === 'dark');
    root.style.colorScheme = next;
    try {
      localStorage.setItem('buncho-theme', next);
    } catch {}
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Switch between light and dark theme"
      title="Switch theme"
      className={`grid h-9 w-9 place-items-center rounded-full transition-colors ${
        premium
          ? 'border border-amber-400/40 bg-amber-400/20 text-amber-800 hover:bg-amber-400/30 dark:border-amber-300/25 dark:bg-amber-300/10 dark:text-amber-300 dark:hover:bg-amber-300/20'
          : 'text-ink hover:text-accent'
      }`}
    >
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </button>
  );
}
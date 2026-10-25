'use client';

import { Moon, Sun } from './icons';

// The icon swap is pure CSS (dark: variants), so there is no hydration mismatch.
// premium: gold circle for Pro members.
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
          ? 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-amber-950 shadow-sm shadow-amber-500/40 hover:opacity-90'
          : 'text-ink hover:text-accent'
      }`}
    >
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </button>
  );
}
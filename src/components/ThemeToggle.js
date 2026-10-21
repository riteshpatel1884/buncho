'use client';

import { Moon, Sun } from './icons';

// The icon swap is pure CSS (dark: variants), so there is no hydration mismatch.
export default function ThemeToggle() {
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
      className="grid h-9 w-9 place-items-center rounded-full text-ink transition-colors hover:text-accent"
    >
      <Sun className="hidden dark:block" />
      <Moon className="dark:hidden" />
    </button>
  );
}
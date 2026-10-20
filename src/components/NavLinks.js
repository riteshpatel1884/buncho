'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

// links: [{ href, label, match?: string[] }]. `match` lists extra path prefixes that keep the link highlighted.
export default function NavLinks({ links }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Main" className="hidden items-center gap-1 md:flex">
      {links.map((l) => {
        const prefixes = [l.href, ...(l.match ?? [])];
        const on = prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={on ? 'page' : undefined}
            className={`rounded-md px-3 py-1.5 text-sm transition-colors ${on ? 'font-semibold text-ink' : 'font-medium text-muted hover:text-ink'}`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
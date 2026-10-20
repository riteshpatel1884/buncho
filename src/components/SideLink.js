'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function SideLink({ href, icon, count, exact = false, children }) {
  const pathname = usePathname();
  const on = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
  return (
    <Link
      href={href}
      aria-current={on ? 'page' : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
        on ? 'bg-surface-2 text-ink' : 'text-muted hover:bg-surface-2 hover:text-ink'
      }`}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{children}</span>
      {count != null && <span className="text-xs text-muted">{count}</span>}
    </Link>
  );
}

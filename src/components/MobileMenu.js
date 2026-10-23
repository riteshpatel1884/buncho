'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Close, Menu } from './icons';

// cta: optional extra link shown at the end of the menu, e.g. { href: '/register', label: 'Sign up' }
export default function MobileMenu({ links, cta = null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((v) => !v)}
        className="grid h-9 w-9 place-items-center rounded-full bg-surface-2"
      >
        {open ? <Close /> : <Menu />}
      </button>
      {open && (
        <nav id="mobile-nav" className="absolute inset-x-0 top-full mt-2 rounded-3xl border border-line bg-surface px-6 py-3 shadow-lg">
          <ul>
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block py-3 text-lg font-medium">
                  {l.label}
                </Link>
              </li>
            ))}
            {cta && (
              <li>
                <Link href={cta.href} className="block py-3 text-lg font-medium">
                  {cta.label}
                </Link>
              </li>
            )}
          </ul>
        </nav>
      )}
    </div>
  );
}
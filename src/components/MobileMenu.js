'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { Close, Menu } from './icons';

const GOLD = 'bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-amber-950 shadow-sm shadow-amber-500/40 hover:opacity-90';
const rowBtn = 'block w-full py-3 text-left text-lg font-medium';

// cta: optional extra link at the end of the menu, e.g. { href: '/register', label: 'Sign up' }
// profile: { name, email, imageUrl } for a signed-in visitor (shown at the top, with account actions), otherwise null
// premium: gold hamburger and ring for Pro members
export default function MobileMenu({ links, cta = null, profile = null, premium = false }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { openUserProfile, signOut } = useClerk();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="md:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen((v) => !v)}
        className={`grid h-9 w-9 place-items-center rounded-full transition ${premium ? GOLD : 'bg-surface-2'}`}
      >
        {open ? <Close /> : <Menu />}
      </button>

      {open && (
        <nav
          id="mobile-nav"
          className={`absolute inset-x-0 top-full mt-2 rounded-3xl border bg-surface px-6 py-3 shadow-lg ${premium ? 'border-amber-400/50' : 'border-line'}`}
        >
          {profile && (
            <div className="flex items-center gap-3 border-b border-line pb-3 pt-1">
              <span className={`shrink-0 ${premium ? 'rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 p-[2px]' : ''}`}>
                {profile.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={profile.imageUrl} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-accent-soft text-base font-semibold text-accent">
                    {(profile.name ?? profile.email ?? '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </span>
              <div className="min-w-0">
                <p className="truncate font-semibold leading-tight">{profile.name ?? 'Your account'}</p>
                {profile.email && <p className="truncate text-xs text-muted">{profile.email}</p>}
              </div>
            </div>
          )}

          <ul>
            {links.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="block py-3 text-lg font-medium">
                  {l.label}
                </Link>
              </li>
            ))}
            {!profile && (
              <li>
                <Link href="/login" className="block py-3 text-lg font-medium">
                  Log in
                </Link>
              </li>
            )}
            {cta && (
              <li>
                <Link href={cta.href} className="block py-3 text-lg font-medium">
                  {cta.label}
                </Link>
              </li>
            )}
          </ul>

          {profile && (
            <ul className="border-t border-line">
              <li>
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    openUserProfile();
                  }}
                  className={rowBtn}
                >
                  Manage account
                </button>
              </li>
              <li>
                <button type="button" onClick={() => signOut({ redirectUrl: '/' })} className={`${rowBtn} text-muted`}>
                  Sign out
                </button>
              </li>
            </ul>
          )}
        </nav>
      )}
    </div>
  );
}
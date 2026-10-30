'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useClerk } from '@clerk/nextjs';
import { Code, Grid } from './icons';
import { Crown } from './ProBadge';

const ICON = { width: 22, height: 22 };
const sheetRow = 'block w-full rounded-xl px-3 py-3 text-left text-base font-medium hover:bg-surface-2';

function UserIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
    </svg>
  );
}

// Phone-only bottom navigation bar (hidden from the md breakpoint up, where the top navbar links take over).
// signedIn / isPro / admin come from the server navbar. profile: { name, email, imageUrl } or null.
export default function MobileBottomNav({ signedIn = false, isPro = false, admin = false, profile = null }) {
  const pathname = usePathname();
  const { openUserProfile, signOut } = useClerk();
  const [open, setOpen] = useState(false);

  // Close the account sheet after any navigation, and on Escape
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const isOn = (href, match = []) => [href, ...match].some((p) => pathname === p || pathname.startsWith(`${p}/`));

  const tabs = [
    { href: '/problems', label: 'Problems', match: ['/topics'], icon: <Code {...ICON} /> },
    ...(signedIn ? [{ href: '/dashboard', label: 'Dashboard', icon: <Grid {...ICON} /> }] : []),
    { href: '/pricing', label: 'Pro', icon: <Crown {...ICON} />, gold: isPro },
  ];

  const activeColor = isPro ? 'text-amber-700 dark:text-amber-300' : 'text-accent';
  const tabBase = 'relative flex flex-1 flex-col items-center justify-center gap-0.5 text-[0.68rem] font-medium transition-colors active:bg-surface-2/60';
  const barLook = isPro
    ? 'border-amber-400/50 bg-gradient-to-r from-amber-50/95 via-yellow-100/95 to-amber-50/95 dark:border-amber-400/40 dark:from-[#2b210a]/95 dark:via-[#3b2d08]/95 dark:to-[#2b210a]/95'
    : 'border-line bg-surface/95';

  const accountOn = open || isOn('/account');

  return (
    <>
      {open && (
        <>
          <button
            type="button"
            aria-label="Close account menu"
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 bg-black/40 md:hidden"
          />
          <div
            id="mobile-account-sheet"
            role="dialog"
            aria-label="Account"
            style={{ bottom: 'calc(var(--bottom-nav-h) + env(safe-area-inset-bottom, 0px) + 0.5rem)' }}
            className={`fixed inset-x-3 z-[45] rounded-3xl border bg-surface p-3 shadow-2xl md:hidden ${isPro ? 'border-amber-400/50' : 'border-line'}`}
          >
            {signedIn ? (
              <>
                <div className="flex items-center gap-3 border-b border-line px-2 pb-3 pt-1">
                  <span className={`shrink-0 ${isPro ? 'rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 p-[2px]' : ''}`}>
                    {profile?.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={profile.imageUrl} alt="" width={40} height={40} className="h-10 w-10 rounded-full object-cover" />
                    ) : (
                      <span className="grid h-10 w-10 place-items-center rounded-full bg-accent-soft text-base font-semibold text-accent">
                        {(profile?.name ?? profile?.email ?? '?').charAt(0).toUpperCase()}
                      </span>
                    )}
                  </span>
                  <div className="min-w-0">
                    <p className="truncate font-semibold leading-tight">{profile?.name ?? 'Your account'}</p>
                    {profile?.email && <p className="truncate text-xs text-muted">{profile.email}</p>}
                  </div>
                </div>
                <ul className="pt-2">
                  <li>
                    <Link href="/jobs" className={sheetRow}>Job prep</Link>
                  </li>
                  {admin && (
                    <li>
                      <Link href="/admin" className={sheetRow}>Admin</Link>
                    </li>
                  )}
                  <li>
                    <button
                      type="button"
                      onClick={() => {
                        setOpen(false);
                        openUserProfile();
                      }}
                      className={sheetRow}
                    >
                      Manage account
                    </button>
                  </li>
                  <li>
                    <button type="button" onClick={() => signOut({ redirectUrl: '/' })} className={`${sheetRow} text-muted`}>
                      Sign out
                    </button>
                  </li>
                </ul>
              </>
            ) : (
              <div className="space-y-2 p-1">
                <p className="px-2 pt-1 text-sm text-muted">Log in to save progress, get AI feedback and track your streak.</p>
                <Link href="/login" className="flex h-11 items-center justify-center rounded-xl border border-line text-base font-semibold hover:bg-surface-2">
                  Log in
                </Link>
                <Link href="/register" className="flex h-11 items-center justify-center rounded-xl bg-accent text-base font-semibold text-accent-ink hover:opacity-90">
                  Create free account
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      <nav
        aria-label="Primary"
        className={`fixed inset-x-0 bottom-0 z-50 border-t backdrop-blur-md pb-[env(safe-area-inset-bottom,0px)] md:hidden ${barLook}`}
      >
        <div className="flex h-[var(--bottom-nav-h)] items-stretch">
          {tabs.map((t) => {
            const on = isOn(t.href, t.match);
            const color = on ? activeColor : t.gold ? 'text-amber-600 dark:text-amber-300' : 'text-muted';
            return (
              <Link key={t.href} href={t.href} aria-current={on ? 'page' : undefined} className={`${tabBase} ${color}`}>
                {on && <span aria-hidden="true" className="absolute top-0 h-0.5 w-8 rounded-full bg-current" />}
                {t.icon}
                <span>{t.label}</span>
              </Link>
            );
          })}

          <button
            type="button"
            aria-expanded={open}
            aria-controls="mobile-account-sheet"
            onClick={() => setOpen((v) => !v)}
            className={`${tabBase} ${accountOn ? activeColor : 'text-muted'}`}
          >
            {accountOn && <span aria-hidden="true" className="absolute top-0 h-0.5 w-8 rounded-full bg-current" />}
            {signedIn && profile?.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.imageUrl} alt="" width={24} height={24} className={`h-[22px] w-[22px] rounded-full object-cover ${accountOn ? 'ring-2 ring-current' : ''}`} />
            ) : (
              <UserIcon {...ICON} />
            )}
            <span>{signedIn ? 'Account' : 'Log in'}</span>
          </button>
        </div>
      </nav>
    </>
  );
}

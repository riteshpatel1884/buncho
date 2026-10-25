import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import Logo from './Logo';
import NavLinks from './NavLinks';
import NavShell from './NavShell';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';
import { ProBadge } from './ProBadge';
import { Search } from './icons';
import { getOrCreateUser } from '@/lib/user';
import { getIsPro } from '@/lib/subscription';
import { isAdmin } from '@/lib/admin';

export default async function Navbar() {
  const { userId } = await auth();
  const user = userId ? await getOrCreateUser() : null;
  const isPro = user ? await getIsPro(user.id) : false;

    const links = [
    { href: '/problems', label: 'Problems', match: ['/topics'] },
    { href: '/blog', label: 'Blog' },
    ...(userId
      ? [
          { href: '/jobs', label: 'Job prep' },
          { href: '/dashboard', label: 'Dashboard' },
        ]
      : []),
    ...(isAdmin(user) ? [{ href: '/admin', label: 'Admin' }] : []),
    { href: '/pricing', label: 'Pricing' },
  ];

  const searchBase =
    'h-9 w-52 rounded-full pl-9 pr-3 text-sm outline-none transition-[width,background-color,box-shadow,border-color] duration-300 group-data-[compact=true]/nav:h-8 group-data-[compact=true]/nav:w-40';
  const searchLook = isPro
    ? 'border border-amber-400/60 bg-white/70 text-ink shadow-inner shadow-amber-500/10 placeholder:text-amber-800/60 focus:border-amber-500 focus:bg-white focus:ring-4 focus:ring-amber-400/25 dark:border-amber-400/40 dark:bg-amber-400/10 dark:placeholder:text-amber-200/60 dark:focus:bg-amber-400/15'
    : 'bg-surface-2 placeholder:text-muted';

  return (
    <NavShell premium={isPro}>
      <div className="flex h-full w-full items-center gap-3 px-4 sm:gap-4 sm:px-5">
        <Link
          href="/"
          aria-label="Buncho home"
          className="origin-left transition-transform duration-300 group-data-[compact=true]/nav:scale-90"
        >
          <Logo />
        </Link>
        {isPro && <ProBadge className="-ml-1" />}
        <NavLinks links={links} />

        <div className="ml-auto flex items-center gap-2">
          <form action="/problems" role="search" className="relative hidden lg:block">
            <label htmlFor="nav-search" className="sr-only">Search problems</label>
            <Search
              width={16}
              height={16}
              className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 ${isPro ? 'text-amber-600 dark:text-amber-300' : 'text-muted'}`}
            />
            <input
              id="nav-search"
              name="q"
              type="search"
              placeholder="Search problems"
              className={`${searchBase} ${searchLook}`}
            />
          </form>
          <ThemeToggle />
          {userId ? (
            isPro ? (
              <span className="grid place-items-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 p-[2px] shadow-sm shadow-amber-500/40">
                <UserButton />
              </span>
            ) : (
              <UserButton />
            )
          ) : (
            <>
              <Link href="/login" className="hidden px-3 py-2 text-sm font-medium text-muted hover:text-ink sm:block">
                Log in
              </Link>
              <Link href="/register" className="hidden rounded-full bg-accent px-3.5 py-1.5 text-sm font-semibold text-accent-ink hover:opacity-90 md:block">
                Sign up
              </Link>
            </>
          )}
          <MobileMenu links={links} cta={userId ? null : { href: '/register', label: 'Sign up' }} />
        </div>
      </div>
    </NavShell>
  );
}
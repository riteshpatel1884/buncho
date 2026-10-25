import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import Logo from './Logo';
import NavLinks from './NavLinks';
import NavShell from './NavShell';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';
import { Crown, ProBadge } from './ProBadge';
import { Search } from './icons';
import { getOrCreateUser } from '@/lib/user';
import { getIsPro } from '@/lib/subscription';

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
    { href: '/pricing', label: 'Pricing' },
  ];

  return (
    <NavShell premium={isPro}>
      <div className="flex h-full w-full items-center gap-2 px-3 sm:gap-4 sm:px-5">
        <Link
          href="/"
          aria-label="Buncho home"
          className="shrink-0 origin-left transition-transform duration-300 group-data-[compact=true]/nav:scale-90"
        >
          <Logo />
        </Link>

        {isPro && (
          <>
            {/* Wide screens: the PRO pill. Phones: just a crown, so everything fits in the bar. */}
            <ProBadge className="-ml-1 hidden sm:inline-flex" />
            <span
              title="Buncho Pro"
              aria-label="Buncho Pro"
              className="hidden h-6 w-6 shrink-0 place-items-center rounded-full bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 text-amber-950 shadow-sm shadow-amber-500/30 min-[360px]:grid sm:hidden"
            >
              <Crown width={13} height={13} />
            </span>
          </>
        )}

        <NavLinks links={links} />

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <form action="/problems" role="search" className="relative hidden lg:block">
            <label htmlFor="nav-search" className="sr-only">Search problems</label>
            <Search width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="nav-search"
              name="q"
              type="search"
              placeholder="Search problems"
              className="h-9 w-52 rounded-full bg-surface-2 pl-9 pr-3 text-sm outline-none transition-[width] duration-300 placeholder:text-muted group-data-[compact=true]/nav:h-8 group-data-[compact=true]/nav:w-40"
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
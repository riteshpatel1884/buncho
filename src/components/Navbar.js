import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import Logo from './Logo';
import NavLinks from './NavLinks';
import NavShell from './NavShell';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';
import { Search } from './icons';

export default async function Navbar() {
  const { userId } = await auth();

  const links = [
    { href: '/problems', label: 'Problems', match: ['/topics'] },
    ...(userId
      ? [
          { href: '/jobs', label: 'Job prep' },
          { href: '/dashboard', label: 'Dashboard' },
        ]
      : []),
    { href: '/pricing', label: 'Pricing' },
  ];

  return (
    <NavShell>
      <div className="flex h-full w-full items-center gap-3 px-4 sm:gap-4 sm:px-5">
        <Link
          href="/"
          aria-label="Buncho home"
          className="origin-left transition-transform duration-300 group-data-[compact=true]/nav:scale-90"
        >
          <Logo />
        </Link>
        <NavLinks links={links} />

        <div className="ml-auto flex items-center gap-2">
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
            <UserButton />
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
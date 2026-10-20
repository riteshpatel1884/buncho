import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import Logo from './Logo';
import NavLinks from './NavLinks';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';
import { Search } from './icons';

export default async function Navbar() {
  const { userId } = await auth();

  const links = [
    { href: '/problems', label: 'Problems', match: ['/topics'] },
    ...(userId ? [{ href: '/dashboard', label: 'Dashboard' }, { href: '/profile', label: 'Profile' }] : []),
  ];

  return (
    <header className="relative z-40 border-b border-line bg-surface">
      <div className="mx-auto flex h-14 w-full max-w-[96rem] items-center gap-4 px-4">
        <Link href="/" aria-label="Buncho home">
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
              className="h-9 w-56 rounded-full bg-surface-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted focus:ring-1 focus:ring-accent"
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
              <Link href="/register" className="rounded-md bg-accent px-3.5 py-1.5 text-sm font-semibold text-accent-ink hover:opacity-90">
                Sign up
              </Link>
            </>
          )}
          <MobileMenu links={links} />
        </div>
      </div>
    </header>
  );
}
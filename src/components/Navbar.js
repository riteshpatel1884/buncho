import Link from 'next/link';
import { auth } from '@clerk/nextjs/server';
import { UserButton } from '@clerk/nextjs';
import Logo from './Logo';
import ThemeToggle from './ThemeToggle';
import MobileMenu from './MobileMenu';

export default async function Navbar() {
  const { userId } = await auth();

  const links = [
    { href: '/problems', label: 'Problems' },
    ...(userId ? [{ href: '/dashboard', label: 'Dashboard' }, { href: '/profile', label: 'Profile' }] : []),
  ];

  return (
    <header className="relative z-40 border-b border-line bg-bg/90 backdrop-blur">
      <div className="wrap flex h-16 items-center justify-between gap-4">
        <div className="flex items-center gap-8">
          <Link href="/" aria-label="Buncho home">
            <Logo />
          </Link>
          <nav aria-label="Main" className="hidden items-center gap-6 md:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="text-[0.95rem] font-medium text-muted transition-colors hover:text-ink">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <ThemeToggle />
          {userId ? (
            <UserButton />
          ) : (
            <>
              <Link href="/login" className="hidden px-3 py-2 text-[0.95rem] font-medium sm:block">
                Log in
              </Link>
              <Link href="/register" className="rounded-lg bg-accent px-4 py-2.5 text-[0.95rem] font-semibold text-accent-ink">
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

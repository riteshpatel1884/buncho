import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="site-footer mt-10 border-t border-line bg-surface">
      <div className="mx-auto flex w-full max-w-[96rem] flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Logo />
          <p className="hidden text-sm text-muted md:block">Practice for AI, ML and GenAI engineering interviews.</p>
        </div>
        <nav aria-label="Footer" className="flex gap-6 text-sm font-medium text-muted">
          <Link href="/problems" className="hover:text-ink">Problems</Link>
          <Link href="/register" className="hover:text-ink">Create account</Link>
          <Link href="/login" className="hover:text-ink">Log in</Link>
        </nav>
      </div>
    </footer>
  );
}
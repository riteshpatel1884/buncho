import Link from 'next/link';
import Logo from './Logo';

export default function Footer() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="wrap flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Logo />
          <p className="mt-2 max-w-sm text-sm text-muted">Practice for AI, ML and GenAI engineering interviews.</p>
        </div>
        <nav aria-label="Footer" className="flex gap-6 text-sm font-medium">
          <Link href="/problems">Problems</Link>
          <Link href="/register">Create account</Link>
        </nav>
      </div>
    </footer>
  );
}

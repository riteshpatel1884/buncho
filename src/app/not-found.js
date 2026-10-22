import Link from 'next/link';

export const metadata = { title: 'Page not found', robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <div className="mx-auto grid w-full max-w-xl place-items-center px-4 py-20">
      <div className="panel w-full p-8 text-center">
        <p className="text-5xl font-semibold text-accent">404</p>
        <h1 className="mt-3 text-xl font-semibold">We couldn&rsquo;t find that page</h1>
        <p className="mx-auto mt-2 max-w-prose text-sm text-muted">
          The link may be old, or the problem may have been unpublished.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/problems" className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:opacity-90">
            Browse problems
          </Link>
          <Link href="/" className="rounded-md bg-surface-2 px-4 py-2 text-sm font-semibold hover:bg-line">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
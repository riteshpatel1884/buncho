import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="wrap py-24">
      <h1 className="font-display text-4xl font-bold">We couldn&rsquo;t find that page</h1>
      <p className="mt-3 max-w-prose text-muted">
        The link may be old, or the problem may have been unpublished.
      </p>
      <Link href="/problems" className="mt-6 inline-flex rounded-lg bg-accent px-4 py-2.5 font-medium text-accent-ink">
        Browse problems
      </Link>
    </div>
  );
}

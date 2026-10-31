import Link from 'next/link';

export const metadata = { title: 'Profile not found', robots: { index: false, follow: false } };

export default function ProfileNotFound() {
  return (
    <div className="mx-auto grid w-full max-w-xl place-items-center px-4 py-20">
      <div className="card w-full p-8 text-center">
        <p className="text-5xl font-semibold text-accent">@?</p>
        <h1 className="mt-3 text-xl font-semibold">No profile here</h1>
        <p className="mx-auto mt-2 max-w-prose text-sm text-muted">
          This username is not taken, or the profile is private. If it should be yours, you can claim it for free.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/settings/profile" className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink hover:opacity-90">
            Claim a username
          </Link>
          <Link href="/problems" className="rounded-md bg-surface-2 px-4 py-2 text-sm font-semibold hover:bg-line">
            Browse problems
          </Link>
        </div>
      </div>
    </div>
  );
}
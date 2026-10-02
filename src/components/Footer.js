import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 sm:px-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-lg font-bold">buncho<span className="text-brand">.</span></p>
          <p className="mt-2 max-w-xs text-sm text-muted">
            A home for products built by Indian founders, and the people who like finding them.
          </p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold">Explore</p>
          <Link href="/" className="block text-muted hover:text-ink">Discover products</Link>
          <Link href="/submit" className="block text-muted hover:text-ink">Launch a product</Link>
          <Link href="/dashboard" className="block text-muted hover:text-ink">Founder dashboard</Link>
          <Link href="/ranking" className="block text-muted hover:text-ink">How ranking works</Link>
          <Link href="/partners" className="block text-muted hover:text-ink">Tools for founders</Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold">Account</p>
          <Link href="/sign-in" className="block text-muted hover:text-ink">Sign in</Link>
          <Link href="/sign-up" className="block text-muted hover:text-ink">Create account</Link>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">
        © {new Date().getFullYear()} buncho. Made in India.
      </div>
    </footer>
  );
}
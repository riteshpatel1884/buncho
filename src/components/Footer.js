import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:grid-cols-[1.5fr_1fr_1fr] sm:px-6">
        <div>
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

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-8 px-4 py-10 sm:px-6 md:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="col-span-2 md:col-span-1">
          <p className="font-display text-lg font-bold">buncho<span className="text-brand">.</span></p>
          <p className="mt-2 max-w-xs text-sm text-muted">Get help from people who've already done it.</p>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold">Students</p>
          <Link href="/experts" className="block text-muted hover:text-ink">Find experts</Link>
          <Link href="/dashboard" className="block text-muted hover:text-ink">My bookings</Link>
        </div>
        <div className="space-y-2 text-sm">
          <p className="font-semibold">Experts</p>
          <Link href="/onboarding/expert" className="block text-muted hover:text-ink">Become an expert</Link>
          <Link href="/sign-in" className="block text-muted hover:text-ink">Sign in</Link>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">© {new Date().getFullYear()} buncho. Made in India.</div>
    </footer>
  );
}

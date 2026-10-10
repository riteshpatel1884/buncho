import Link from "next/link";
import Logo from "./Logo";

export default function Footer() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-4 py-12 sm:px-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">Get help from people who've already done it. Verified seniors and professionals, booked in a minute.</p>
        </div>
        <div className="space-y-2.5 text-sm">
          <p className="font-semibold">Students</p>
          <Link href="/experts" className="block text-muted hover:text-brand">Find experts</Link>
          <Link href="/dashboard" className="block text-muted hover:text-brand">My bookings</Link>
        </div>
        <div className="space-y-2.5 text-sm">
          <p className="font-semibold">Experts</p>
          <Link href="/onboarding/expert" className="block text-muted hover:text-brand">Become an expert</Link>
          <Link href="/sign-in" className="block text-muted hover:text-brand">Sign in</Link>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">© {new Date().getFullYear()} Buncho. Made in India.</div>
    </footer>
  );
}
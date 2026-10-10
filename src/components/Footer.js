import Link from "next/link";
import Logo from "./Logo";
import { getDbUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";

export default async function Footer() {
  const me = await getDbUser().catch(() => null);
  const isExpert = me?.role === "EXPERT";
  const isStudent = me?.role === "STUDENT";

  const profile = isExpert
    ? await prisma.expertProfile.findUnique({ where: { userId: me.id }, select: { slug: true } }).catch(() => null)
    : null;

  const link = "block text-muted hover:text-brand";

  // Experts don't see student links, students don't see expert links, and signed-in people don't need "Sign in".
  const showStudents = !isExpert;
  const showExperts = !isStudent;

  return (
    <footer className="border-t border-line bg-surface pb-24 md:pb-0">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-10 px-4 py-12 sm:px-6 md:grid-cols-[minmax(0,2fr)_repeat(3,minmax(0,1fr))]">
        <div className="col-span-2 md:col-span-1">
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-muted">Get help from people who've already done it. Verified seniors and professionals, booked in a minute.</p>
        </div>

        {showStudents && (
          <div className="space-y-2.5 text-sm">
            <p className="font-semibold">Students</p>
            <Link href="/experts" className={link}>Find experts</Link>
            <Link href="/dashboard" className={link}>My bookings</Link>
          </div>
        )}

        {showExperts && (
          <div className="space-y-2.5 text-sm">
            <p className="font-semibold">Experts</p>
            {isExpert ? (
              <>
                <Link href="/dashboard" className={link}>Dashboard</Link>
                {profile && <Link href={`/experts/${profile.slug}`} className={link}>My profile</Link>}
              </>
            ) : (
              <>
                <Link href="/onboarding/expert" className={link}>Become an expert</Link>
                {!me && <Link href="/sign-in" className={link}>Sign in</Link>}
              </>
            )}
          </div>
        )}

        <div className="space-y-2.5 text-sm">
          <p className="font-semibold">Buncho</p>
          <Link href="/terms" className={link}>Terms and Conditions</Link>
          <Link href="/privacy" className={link}>Privacy Policy</Link>
          <Link href="/refund-policy" className={link}>Refund and Cancellation</Link>
          <Link href="/community-guidelines" className={link}>Community Guidelines</Link>
          <Link href="/contact" className={link}>Contact and Grievances</Link>
        </div>
      </div>
      <div className="border-t border-line py-4 text-center text-xs text-muted">© {new Date().getFullYear()} Buncho. Made in India.</div>
    </footer>
  );
}
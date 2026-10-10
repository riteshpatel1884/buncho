import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { isAdmin } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import Logo from "./Logo";
import MobileMenu from "./MobileMenu";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";
import { REVIEW_WHERE, REPLY_OPEN } from "@/lib/review";

export default async function Navbar() {
  const admin = await isAdmin();
  const [toReview, repliesOpen] = admin
    ? await Promise.all([
        prisma.expertProfile.count({ where: REVIEW_WHERE }).catch(() => 0),
        prisma.bookingReply.count({ where: REPLY_OPEN }).catch(() => 0),
      ])
    : [0, 0];
  const waiting = toReview + repliesOpen;
  const adminBadge = waiting > 0 && (
    <span className="ml-1.5 rounded-full bg-brand px-1.5 py-0.5 text-[11px] font-bold text-on-brand">{waiting}</span>
  );
  const item = "block rounded-lg px-3 py-3 text-base font-medium hover:bg-surface-2";
  const link = "hidden text-muted transition-colors hover:text-ink md:block";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-surface/85 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-10">
          <Link href="/" aria-label="Buncho home"><Logo /></Link>
          <div className="hidden items-center gap-7 text-sm font-medium md:flex">
            <Link href="/experts" className="text-muted transition-colors hover:text-ink">Find experts</Link>
            <Link href="/onboarding/expert" className="text-muted transition-colors hover:text-ink">Become an expert</Link>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium sm:gap-4">
          <ThemeToggle />
          <Show when="signed-in">
            <Link href="/dashboard" className={link}>Dashboard</Link>
            {admin && <Link href="/admin" className={link}>Admin{adminBadge}</Link>}
            <UserMenu />
          </Show>
          <Show when="signed-out">
            <Link href="/sign-in" className={link}>Sign in</Link>
            <Link href="/sign-up" className="btn-primary !px-4 sm:!px-5">Get started</Link>
          </Show>

          <MobileMenu>
            <div className="flex flex-col">
              <Link href="/experts" className={item}>Find experts</Link>
              <Link href="/onboarding/expert" className={item}>Become an expert</Link>
              <Show when="signed-in">
                <Link href="/dashboard" className={item}>Dashboard</Link>
                {admin && <Link href="/admin" className={item}>Admin{adminBadge}</Link>}
              </Show>
              <Show when="signed-out">
                <Link href="/sign-in" className={item}>Sign in</Link>
              </Show>
            </div>
          </MobileMenu>
        </div>
      </nav>
    </header>
  );
}
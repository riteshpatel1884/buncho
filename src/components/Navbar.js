import Link from "next/link";
import { Show } from "@clerk/nextjs";
import { isAdmin } from "@/lib/user";
import MobileMenu from "./MobileMenu";
import ThemeToggle from "./ThemeToggle";
import UserMenu from "./UserMenu";

export default async function Navbar() {
  const admin = await isAdmin();
  const item = "block rounded-xl px-3 py-3 text-base font-medium hover:bg-surface-2";
  return (
    <header className="nav-scroll sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="group flex items-center gap-2 font-display text-xl font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-on-brand transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110">b</span>
            <span>buncho<span className="text-brand">.</span></span>
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
            <Link href="/experts" className="link-underline hover:text-ink">Find experts</Link>
            <Link href="/onboarding/expert" className="link-underline hover:text-ink">Become an expert</Link>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm font-medium sm:gap-3">
          <ThemeToggle />
          <Show when="signed-in">
            <Link href="/dashboard" className="link-underline hidden text-muted hover:text-ink md:block">Dashboard</Link>
            {admin && <Link href="/admin" className="link-underline hidden text-muted hover:text-ink md:block">Admin</Link>}
            <UserMenu />
          </Show>
          <Show when="signed-out">
            <Link href="/sign-in" className="hidden text-muted hover:text-ink md:block">Sign in</Link>
            <Link href="/sign-up" className="btn-primary !px-4 sm:!px-5">Get started</Link>
          </Show>

          <MobileMenu>
            <div className="flex flex-col">
              <Link href="/experts" className={item}>Find experts</Link>
              <Link href="/onboarding/expert" className={item}>Become an expert</Link>
              <Show when="signed-in">
                <Link href="/dashboard" className={item}>Dashboard</Link>
                {admin && <Link href="/admin" className={item}>Admin</Link>}
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

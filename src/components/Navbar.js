import Link from "next/link";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { isAdmin } from "@/lib/user";

export default async function Navbar() {
  const admin = await isAdmin();
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-paper/85 backdrop-blur">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-peacock-dark text-white">b</span>
            <span>buncho<span className="text-brand">.</span></span>
          </Link>
          <div className="hidden items-center gap-6 text-sm font-medium text-muted sm:flex">
            <Link href="/" className="hover:text-ink">Discover</Link>
            <Link href="/submit" className="hover:text-ink">Launch</Link>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm font-medium">
          <Show when="signed-in">
            <Link href="/dashboard" className="hidden text-muted hover:text-ink sm:block">Dashboard</Link>
            {admin && <Link href="/admin" className="hidden text-muted hover:text-ink sm:block">Moderation</Link>}
            <UserButton />
          </Show>
          <Show when="signed-out">
            <SignInButton mode="redirect">
              <button className="text-muted hover:text-ink">Sign in</button>
            </SignInButton>
          </Show>
          <Link href="/submit" className="btn-primary">Launch a product</Link>
        </div>
      </nav>
    </header>
  );
}

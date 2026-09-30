import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { isAdmin } from "@/lib/user";

export default async function Navbar() {
  const admin = await isAdmin();
  return (
    <header className="border-b border-line bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="font-display text-xl font-bold">
          Desi Launch
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/submit" className="rounded-md bg-accent px-3 py-1.5 font-medium text-white">
            Launch a product
          </Link>
          <SignedIn>
            <Link href="/dashboard">Dashboard</Link>
            {admin && <Link href="/admin">Moderation</Link>}
            <UserButton />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="redirect">
              <button className="font-medium">Sign in</button>
            </SignInButton>
          </SignedOut>
        </div>
      </nav>
    </header>
  );
}

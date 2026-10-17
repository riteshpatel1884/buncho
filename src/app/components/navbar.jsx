import Link from "next/link";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import ThemeToggle from "./theme-toggle";
import { btnGhost, btnPrimary } from "./ui";

const links = [
  { href: "/polls", label: "Before It Happens" },
  { href: "/challenges", label: "CrowdQuest" },
];

export default function Navbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-border bg-bg/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-bold tracking-tight">
            bun<span className="text-brand">cho</span>
          </Link>
          <nav className="hidden gap-4 text-sm text-muted md:flex">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="hover:text-fg">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <SignedIn>
            <Link href="/polls/new" className={btnPrimary}>New poll</Link>
            <Link href="/profile" className={`${btnGhost} hidden sm:inline-flex`}>Profile</Link>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <Link href="/sign-in" className={btnGhost}>Sign in</Link>
            <Link href="/sign-up" className={`${btnPrimary} hidden sm:inline-flex`}>Join</Link>
          </SignedOut>
        </div>
      </div>
      <nav className="flex gap-4 overflow-x-auto px-4 pb-2 text-sm text-muted md:hidden">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="whitespace-nowrap hover:text-fg">{l.label}</Link>
        ))}
      </nav>
    </header>
  );
}
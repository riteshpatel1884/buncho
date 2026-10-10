import { getDbUser } from "@/lib/user";
import { prisma } from "@/lib/prisma";
import TabBarLinks from "./TabBarLinks";

// App-style bottom navigation, shown on phones only. The tabs depend on who is signed in.
export default async function MobileTabBar() {
  const me = await getDbUser().catch(() => null);
  let items;

  if (me?.role === "EXPERT") {
    const p = await prisma.expertProfile.findUnique({ where: { userId: me.id }, select: { slug: true } }).catch(() => null);
    items = [
      { href: "/", label: "Home", icon: "home" },
      { href: "/dashboard", label: "Dashboard", icon: "list" },
      ...(p ? [{ href: `/experts/${p.slug}`, label: "Profile", icon: "user" }] : []),
      { href: "/dashboard/services", label: "Services", icon: "grid" },
    ];
  } else if (me?.role === "STUDENT") {
    items = [
      { href: "/", label: "Home", icon: "home" },
      { href: "/experts", label: "Experts", icon: "search" },
      { href: "/dashboard", label: "Requests", icon: "list" },
      { href: "/dashboard/profile", label: "Profile", icon: "user" },
    ];
  } else if (me) {
    items = [
      { href: "/", label: "Home", icon: "home" },
      { href: "/experts", label: "Experts", icon: "search" },
      { href: "/onboarding", label: "Get started", icon: "spark" },
    ];
  } else {
    items = [
      { href: "/", label: "Home", icon: "home" },
      { href: "/experts", label: "Experts", icon: "search" },
      { href: "/sign-in", label: "Sign in", icon: "login" },
    ];
  }

  return <TabBarLinks items={items} />;
}
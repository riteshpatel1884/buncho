import { notFound, redirect } from "next/navigation";
import { getDbUser } from "@/lib/user";
import { getPublicProfile } from "@/lib/feed/profile";
import ProfileView from "@/components/feed/ProfileView";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { username } = await params;
  const p = await getPublicProfile(username);
  return p ? { title: `${p.name || "Profile"} (@${p.username}) | buncho`, description: p.roleLine } : {};
}

// buncho.live/<username>: the public profile of anyone who posts. Real pages (feed, experts, ...) win over this route.
export default async function UsernameProfilePage({ params }) {
  const { username } = await params;
  const me = await getDbUser().catch(() => null);
  const profile = await getPublicProfile(username, me?.id ?? null);
  if (!profile) notFound();
  // An old id link, or different capitals, goes to the clean address.
  if (profile.username && username !== profile.username) redirect(`/${profile.username}`);
  return <ProfileView profile={profile} me={me} />;
}
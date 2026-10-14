import { notFound, redirect } from "next/navigation";
import { getDbUser } from "@/lib/user";
import { getPublicProfile } from "@/lib/feed/profile";
import ProfileView from "@/components/feed/ProfileView";

export const dynamic = "force-dynamic";

// Only for people who have no username yet. Everyone else is sent to buncho.live/<username>.
export default async function ProfileByIdPage({ params }) {
  const { id } = await params;
  const me = await getDbUser().catch(() => null);
  const profile = await getPublicProfile(id, me?.id ?? null);
  if (!profile) notFound();
  if (profile.username) redirect(`/${profile.username}`);
  return <ProfileView profile={profile} me={me} />;
}
import { redirect } from 'next/navigation';
import { getOrCreateUser } from '@/lib/user';
import { SITE_URL } from '@/lib/seo';
import { cooldownDaysLeft, suggestUsernames } from '@/lib/username';
import ProfileSettingsForm from '@/components/profile/ProfileSettingsForm';

export const metadata = {
  title: 'Public profile',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export default async function ProfileSettingsPage() {
  const user = await getOrCreateUser();
  if (!user) redirect('/login');

  const suggestions = user.username ? [] : await suggestUsernames({ name: user.name, email: user.email, limit: 4 });

  // Only plain values cross into the client component
  const initial = {
    username: user.username ?? '',
    profileName: user.profileName ?? '',
    headline: user.headline ?? '',
    bio: user.bio ?? '',
    location: user.location ?? '',
    website: user.website ?? '',
    githubHandle: user.githubHandle ?? '',
    linkedinHandle: user.linkedinHandle ?? '',
    xHandle: user.xHandle ?? '',
    profilePublic: user.profilePublic,
    showStats: user.showStats,
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:py-10">
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Public profile</h1>
      <p className="mt-2 max-w-prose text-sm text-muted">
        Pick a unique username and get a link you can share with recruiters, friends and communities. You choose what is shown.
      </p>
      <div className="mt-8">
        <ProfileSettingsForm initial={initial} siteUrl={SITE_URL} lockedDays={cooldownDaysLeft(user.usernameChangedAt)} suggestions={suggestions} />
      </div>
    </div>
  );
}
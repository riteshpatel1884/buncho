import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { getUserStats } from '@/lib/problems';
import ActivityGrid from '@/components/ActivityGrid';
import { StatsCard } from '@/components/StatsCard';

export const metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const user = await getOrCreateUser();
  if (!user) redirect('/login');

  const [stats, bookmarks] = await Promise.all([
    getUserStats(user.id),
    prisma.bookmark.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-4 px-4 py-6">
      <section className="panel flex flex-wrap items-center gap-5 p-6">
        {user.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.imageUrl} alt="" width={80} height={80} className="h-20 w-20 rounded-xl object-cover" />
        ) : (
          <span className="grid h-20 w-20 place-items-center rounded-xl bg-accent-soft text-3xl font-semibold text-accent">
            {(user.name ?? '?').charAt(0).toUpperCase()}
          </span>
        )}
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">{user.name ?? 'Your profile'}</h1>
          {user.email && <p className="text-sm text-muted">{user.email}</p>}
          <p className="mt-1 text-xs text-muted">
            Member since {user.createdAt.toLocaleDateString('en-IN', { dateStyle: 'long' })}
          </p>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <StatsCard stats={stats} signedIn />
        <ActivityGrid stats={stats} />
      </div>

      <dl className="panel grid grid-cols-3 divide-x divide-line text-center">
        {[['Attempted', stats.solved + stats.attempted], ['Completed', stats.solved], ['Bookmarked', bookmarks]].map(([label, value]) => (
          <div key={label} className="px-2 py-4">
            <dd className="text-2xl font-semibold">{value}</dd>
            <dt className="text-sm text-muted">{label}</dt>
          </div>
        ))}
      </dl>

      <p className="text-sm text-muted">
        To change your name, email or password, open your account menu in the top right and choose Manage account.
      </p>
    </div>
  );
}
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';

export const metadata = { title: 'Profile' };

export default async function ProfilePage() {
  const user = await getOrCreateUser();
  if (!user) redirect('/login');

  const [attempted, completed, bookmarks] = await Promise.all([
    prisma.problemProgress.count({ where: { userId: user.id } }),
    prisma.problemProgress.count({ where: { userId: user.id, status: 'COMPLETED' } }),
    prisma.bookmark.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="wrap max-w-3xl py-10 lg:py-14">
      <div className="flex items-center gap-5">
        {user.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.imageUrl} alt="" width={72} height={72} className="h-[72px] w-[72px] rounded-full border border-line object-cover" />
        ) : (
          <span className="grid h-[72px] w-[72px] place-items-center rounded-full bg-accent-soft font-display text-2xl font-bold text-accent">
            {(user.name ?? '?').charAt(0).toUpperCase()}
          </span>
        )}
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight">{user.name ?? 'Your profile'}</h1>
          {user.email && <p className="text-muted">{user.email}</p>}
        </div>
      </div>

      <dl className="mt-10 grid grid-cols-3 gap-y-6">
        {[['Attempted', attempted], ['Completed', completed], ['Bookmarked', bookmarks]].map(([label, value]) => (
          <div key={label} className="border-l-2 border-ink pl-4">
            <dd className="font-display text-3xl font-bold">{value}</dd>
            <dt className="text-sm text-muted">{label}</dt>
          </div>
        ))}
      </dl>

      <p className="mt-10 text-sm text-muted">
        Member since {user.createdAt.toLocaleDateString('en-IN', { dateStyle: 'long' })}. To change your name, email or
        password, open your account menu in the top right and choose Manage account.
      </p>
    </div>
  );
}

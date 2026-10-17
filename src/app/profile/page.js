import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";
import { updateProfile } from "@/app/actions/profile";
import PollCard from "@/components/poll-card";
import { btnPrimary, card, inputCls } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata = { title: "Your profile" };

export default async function ProfilePage() {
  const user = await getDbUser();
  const [polls, voteCount] = await Promise.all([
    prisma.poll.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { author: { select: { username: true } }, tags: true, _count: { select: { votes: true } } },
    }),
    prisma.pollVote.count({ where: { userId: user.id } }),
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold">{user.name}</h1>
        <p className="text-sm text-muted">@{user.username} · {polls.length} polls created · {voteCount} votes cast</p>
      </div>

      <form action={updateProfile} className={`${card} space-y-4 p-6`}>
        <h2 className="font-semibold">Account settings</h2>
        <div>
          <label className="mb-1 block text-sm font-medium">Display name</label>
          <input name="name" defaultValue={user.name} required maxLength={60} className={inputCls} />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium">Bio</label>
          <textarea name="bio" defaultValue={user.bio ?? ""} maxLength={280} rows={3} className={inputCls} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="isPublic" defaultChecked={user.isPublic} className="accent-[var(--brand)]" />
          Public profile
        </label>
        <button className={btnPrimary}>Save changes</button>
      </form>

      <section className="space-y-4">
        <h2 className="font-semibold">Your polls</h2>
        {polls.length ? polls.map((p) => <PollCard key={p.id} poll={p} />) : <p className="text-sm text-muted">You haven&apos;t created any polls yet.</p>}
      </section>
    </div>
  );
}
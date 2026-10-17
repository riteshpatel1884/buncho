import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PollCard from "@/components/poll-card";
import { btnGhost, btnPrimary, card } from "@/components/ui";

export const dynamic = "force-dynamic";

const pillars = [
  { t: "Predict", d: "Time-bound forecasts with transparent outcomes.", live: true },
  { t: "Challenge", d: "Short, user-created tasks with clear rules.", live: false },
  { t: "Prove", d: "A growing public record and shareable receipts.", live: false },
];

export default async function Home() {
  const polls = await prisma.poll.findMany({
    where: { status: "OPEN", closesAt: { gt: new Date() } },
    orderBy: { createdAt: "desc" },
    take: 6,
    include: { author: { select: { username: true } }, tags: true, _count: { select: { votes: true } } },
  });

  return (
    <div className="space-y-12">
      <section className="py-8 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          Don&apos;t just have an opinion.<br />
          <span className="text-brand">Put it to the test.</span>
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Predict what happens next, compare your judgment with the crowd, and build a record of what you get right.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/polls" className={btnPrimary}>Explore predictions</Link>
          <Link href="/polls/new" className={btnGhost}>Create a poll</Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {pillars.map((p) => (
          <div key={p.t} className={`${card} p-5`}>
            <h3 className="font-semibold">{p.t} {!p.live && <span className="ml-1 text-xs font-normal text-muted">soon</span>}</h3>
            <p className="mt-1 text-sm text-muted">{p.d}</p>
          </div>
        ))}
      </section>

      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-bold">Open now</h2>
          <Link href="/polls" className="text-sm text-brand hover:underline">View all</Link>
        </div>
        {polls.length ? (
          <div className="grid gap-4 sm:grid-cols-2">{polls.map((p) => <PollCard key={p.id} poll={p} />)}</div>
        ) : (
          <div className={`${card} p-10 text-center text-sm text-muted`}>
            No open polls yet. <Link href="/polls/new" className="text-brand hover:underline">Create the first one.</Link>
          </div>
        )}
      </section>
    </div>
  );
}
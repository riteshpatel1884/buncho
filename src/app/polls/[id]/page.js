import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";
import { POLL_TYPES, STATUS_STYLES, effectiveStatus, timeLeft } from "@/lib/poll-utils";
import PollResults from "@/components/poll-results";
import VoteForm from "@/components/vote-form";
import ResolveForm from "@/components/resolve-form";
import TagChip from "@/components/tag-chip";
import LocalTime from "@/components/local-time";
import { btnPrimary, card } from "@/components/ui";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { id } = await params;
  const poll = await prisma.poll.findUnique({ where: { id }, select: { question: true } });
  return { title: poll?.question ?? "Poll" };
}

export default async function PollPage({ params }) {
  const { id } = await params;

  const [poll, user] = await Promise.all([
    prisma.poll.findUnique({
      where: { id },
      include: {
        author: { select: { name: true, username: true } },
        tags: true,
        resolution: true,
        options: { orderBy: { position: "asc" }, include: { _count: { select: { votes: true } } } },
      },
    }),
    getDbUser(),
  ]);
  if (!poll) notFound();

  const myVote = user
    ? await prisma.pollVote.findUnique({ where: { pollId_userId: { pollId: poll.id, userId: user.id } } })
    : null;

  const status = effectiveStatus(poll);
  const type = POLL_TYPES[poll.type];
  const options = poll.options.map((o) => ({ id: o.id, text: o.text, votes: o._count.votes }));
  const total = options.reduce((s, o) => s + o.votes, 0);
  const showResults = !!myVote || status !== "OPEN";
  const canResolve =
    user && (user.id === poll.authorId || user.role === "ADMIN") && poll.type === "PREDICTION" && status === "CLOSED";
  const winner = poll.resolution && options.find((o) => o.id === poll.resolution.winningOptionId);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/polls" className="text-sm text-muted hover:text-fg">← All polls</Link>

      <div className={`${card} space-y-4 p-6`}>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full px-2.5 py-0.5 font-medium ${type.cls}`}>{type.label}</span>
          <span className={`rounded-full px-2.5 py-0.5 font-medium ${STATUS_STYLES[status]}`}>{status}</span>
          <span className="text-muted">
            {status === "OPEN" ? timeLeft(poll.closesAt) : <>Closed <LocalTime date={poll.closesAt} /></>}
          </span>
        </div>

        <h1 className="text-2xl font-bold leading-snug">{poll.question}</h1>
        {poll.description && <p className="whitespace-pre-line text-sm text-muted">{poll.description}</p>}

        {poll.type === "PREDICTION" && poll.resolutionCriteria && (
          <div className="rounded-lg border border-brand/40 bg-brand/5 p-3 text-sm">
            <p className="font-medium">Resolution criteria</p>
            <p className="text-muted">{poll.resolutionCriteria}</p>
            {poll.resolutionSource && (
              <a href={poll.resolutionSource} target="_blank" rel="noreferrer" className="text-xs text-brand underline">Resolution source</a>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-2">{poll.tags.map((t) => <TagChip key={t.id} tag={t} />)}</div>

        {showResults ? (
          <PollResults options={options} total={total} myOptionId={myVote?.optionId} winningOptionId={poll.resolution?.winningOptionId} />
        ) : user ? (
          <VoteForm pollId={poll.id} options={options.map(({ id, text }) => ({ id, text }))} />
        ) : (
          <div className="rounded-lg border border-border p-4 text-center text-sm">
            <p className="mb-3 text-muted">Sign in to cast your vote and see the results.</p>
            <Link href="/sign-in" className={btnPrimary}>Sign in</Link>
          </div>
        )}

        <p className="text-xs text-muted">by @{poll.author.username} · {total} vote{total === 1 ? "" : "s"}</p>
      </div>

      {poll.resolution && (
        <div className={`${card} space-y-1 border-emerald-500/40 p-5 text-sm`}>
          <p className="font-semibold">Resolved: {winner?.text}</p>
          <p className="text-muted">{poll.resolution.evidenceNote}</p>
          {poll.resolution.evidenceUrl && (
            <a href={poll.resolution.evidenceUrl} target="_blank" rel="noreferrer" className="text-brand underline">Evidence</a>
          )}
          <p className="text-xs text-muted">Recorded <LocalTime date={poll.resolution.resolvedAt} /></p>
        </div>
      )}

      {canResolve && (
        <ResolveForm pollId={poll.id} options={options} criteria={poll.resolutionCriteria} source={poll.resolutionSource} />
      )}
    </div>
  );
}
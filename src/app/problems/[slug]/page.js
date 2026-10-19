import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { TYPE_LABEL } from '@/lib/constants';
import Markdown from '@/components/Markdown';
import Hints from '@/components/Hints';
import DifficultyBadge from '@/components/DifficultyBadge';
import AnswerEditor from '@/components/AnswerEditor';
import BookmarkButton from '@/components/BookmarkButton';
import { CompleteToggle, RevealButton } from '@/components/SolutionControls';
import { Lock } from '@/components/icons';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await prisma.problem.findFirst({ where: { slug, published: true }, select: { title: true } });
  return { title: p?.title ?? 'Problem' };
}

export default async function ProblemPage({ params }) {
  const { slug } = await params;

  const problem = await prisma.problem.findFirst({
    where: { slug, published: true },
    include: {
      topic: true,
      related: { where: { published: true }, select: { slug: true, title: true, difficulty: true } },
    },
  });
  if (!problem) notFound();

  const user = await getOrCreateUser();
  let progress = null;
  let submission = null;
  let bookmarked = false;

  if (user) {
    const key = { userId_problemId: { userId: user.id, problemId: problem.id } };
    const [pr, sub, bm] = await Promise.all([
      prisma.problemProgress.findUnique({ where: key }),
      prisma.submission.findUnique({ where: key }),
      prisma.bookmark.findUnique({ where: key }),
    ]);
    progress = pr;
    submission = sub;
    bookmarked = Boolean(bm);
  }

  // The solution is only queried on the server once the user has earned access,
  // so it never reaches the browser of someone who hasn't unlocked it.
  const unlocked = Boolean(user && (submission || progress?.solutionRevealed));
  const solution = unlocked ? await prisma.expertSolution.findUnique({ where: { problemId: problem.id } }) : null;
  const loginHref = `/login?redirect_url=${encodeURIComponent(`/problems/${slug}`)}`;

  return (
    <div className="wrap py-8 lg:py-12">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/problems" className="hover:text-ink">Problems</Link>
        <span className="mx-2">/</span>
        <Link href={`/topics/${problem.topic.slug}`} className="hover:text-ink">{problem.topic.name}</Link>
      </nav>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{problem.title}</h1>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted">
            <DifficultyBadge difficulty={problem.difficulty} />
            <span>{TYPE_LABEL[problem.type]}</span>
            <span>{problem.estimatedMinutes} min</span>
            {progress?.status === 'COMPLETED' && <span className="font-semibold text-accent">Completed</span>}
          </div>
        </div>
        <BookmarkButton problemId={problem.id} slug={slug} initial={bookmarked} signedIn={Boolean(user)} />
      </header>

      <div className="mt-10 grid gap-12 lg:grid-cols-[minmax(0,1fr)_260px]">
        <div className="min-w-0 space-y-14">
          <section aria-label="Problem statement">
            <Markdown>{problem.description}</Markdown>
          </section>

          <Hints hints={problem.hints} />

          <section aria-labelledby="answer-heading">
            <h2 id="answer-heading" className="font-display text-2xl font-semibold">Your answer</h2>
            <p className="mt-1 mb-4 text-muted">Your answer is private. Only you can see it.</p>
            {user ? (
              <AnswerEditor problemId={problem.id} initialContent={submission?.content ?? ''} hasSubmission={Boolean(submission)} />
            ) : (
              <div className="rounded-xl border border-dashed border-line px-6 py-10 text-center">
                <p className="font-medium">Log in to write or dictate an answer and unlock the expert solution.</p>
                <div className="mt-4 flex justify-center gap-3">
                  <Link href={loginHref} className="rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink">Log in</Link>
                  <Link href="/register" className="rounded-lg border border-line bg-surface px-5 py-2.5 text-sm font-semibold">Create account</Link>
                </div>
              </div>
            )}
          </section>

          <section aria-labelledby="solution-heading">
            <h2 id="solution-heading" className="font-display text-2xl font-semibold">Expert solution</h2>

            {solution ? (
              <div className="mt-4">
                <p className="mb-5 text-sm text-muted">
                  {solution.reviewedAt
                    ? `Reviewed${solution.reviewedBy ? ` by ${solution.reviewedBy}` : ''} on ${solution.reviewedAt.toLocaleDateString('en-IN', { dateStyle: 'medium' })}.`
                    : 'This solution has not been expert-reviewed yet. Check important details against other sources.'}
                </p>
                <Markdown>{solution.content}</Markdown>
                <div className="mt-8 border-t border-line pt-6">
                  <CompleteToggle problemId={problem.id} completed={progress?.status === 'COMPLETED'} />
                </div>
              </div>
            ) : unlocked ? (
              <p className="mt-4 text-muted">A solution for this problem hasn&rsquo;t been published yet.</p>
            ) : (
              <div className="mt-4 flex flex-col items-start gap-4 rounded-xl border border-line bg-surface px-6 py-7">
                <p className="flex items-center gap-2 font-medium">
                  <Lock width={18} height={18} /> Locked until you attempt this problem
                </p>
                <p className="text-muted">
                  {user
                    ? 'Submit your answer above to unlock the reference solution.'
                    : 'Log in and submit an answer to unlock the reference solution.'}
                </p>
                {user && problem.allowDirectReveal && <RevealButton problemId={problem.id} />}
              </div>
            )}
          </section>
        </div>

        <aside className="space-y-8 self-start lg:sticky lg:top-24">
          <div>
            <h2 className="font-display text-base font-semibold">Relevant roles</h2>
            <ul className="mt-2 flex flex-wrap gap-2">
              {problem.roles.map((r) => (
                <li key={r} className="rounded-full bg-surface-2 px-3 py-1 text-sm">{r}</li>
              ))}
            </ul>
          </div>
          {problem.subcategory && (
            <div>
              <h2 className="font-display text-base font-semibold">Subcategory</h2>
              <p className="mt-2 text-muted">{problem.subcategory}</p>
            </div>
          )}
          {problem.related.length > 0 && (
            <div>
              <h2 className="font-display text-base font-semibold">Related questions</h2>
              <ul className="mt-2 space-y-2">
                {problem.related.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/problems/${r.slug}`} className="text-accent underline underline-offset-4">{r.title}</Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getOrCreateUser } from '@/lib/user';
import { getCommunityAnswers } from '@/lib/community';
import { TYPE_LABEL } from '@/lib/constants';
import Markdown from '@/components/Markdown';
import Hints from '@/components/Hints';
import DifficultyBadge from '@/components/DifficultyBadge';
import AnswerEditor from '@/components/AnswerEditor';
import ShareControl from '@/components/ShareControl';
import CommunitySection from '@/components/CommunitySection';
import BookmarkButton from '@/components/BookmarkButton';
import { CompleteToggle, RevealButton } from '@/components/SolutionControls';
import ProblemTabs from '@/components/ProblemTabs';
import Workspace from '@/components/Workspace';
import Timer from '@/components/Timer';
import { getProblemNeighbors } from '@/lib/problems';
import { ChevronLeft, ChevronRight, Code, FileText, Flask, List, Lock, Users } from '@/components/icons';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const p = await prisma.problem.findFirst({ where: { slug, published: true }, select: { title: true } });
  return { title: p?.title ?? 'Problem' };
}

export default async function ProblemPage({ params, searchParams }) {
  const { slug } = await params;
  const sp = await searchParams;
  const cpage = Math.max(1, parseInt(sp?.cpage, 10) || 1);

  const problem = await prisma.problem.findFirst({
    where: { slug, published: true },
    include: {
      topic: true,
      related: { where: { published: true }, select: { slug: true, title: true, difficulty: true } },
    },
  });
  if (!problem) notFound();

  const [user, neighbors] = await Promise.all([getOrCreateUser(), getProblemNeighbors(slug)]);
  let progress = null;
  let submission = null;
  let ownShared = null;
  let bookmarked = false;

  if (user) {
    const key = { userId_problemId: { userId: user.id, problemId: problem.id } };
    const [pr, sub, bm, shared] = await Promise.all([
      prisma.problemProgress.findUnique({ where: key }),
      prisma.submission.findUnique({ where: key }),
      prisma.bookmark.findUnique({ where: key }),
      prisma.communityAnswer.findUnique({ where: key, select: { status: true, anonymous: true, content: true } }),
    ]);
    progress = pr;
    submission = sub;
    bookmarked = Boolean(bm);
    ownShared = shared;
  }

  // Expert and community content are only queried once the user has earned access,
  // so neither reaches the browser of someone who hasn't unlocked them.
  const unlocked = Boolean(user && (submission || progress?.solutionRevealed));
  const [solution, community] = unlocked
    ? await Promise.all([
        prisma.expertSolution.findUnique({ where: { problemId: problem.id } }),
        getCommunityAnswers({ problemId: problem.id, viewerId: user.id, page: cpage }),
      ])
    : [null, null];

  const shared = ownShared
    ? {
        status: ownShared.status,
        anonymous: ownShared.anonymous,
        outOfDate: Boolean(submission) && ownShared.content !== submission.content,
      }
    : null;

  const loginHref = `/login?redirect_url=${encodeURIComponent(`/problems/${slug}`)}`;

  const pill = 'rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted';
  const sectionTitle = 'cursor-pointer list-none text-sm font-semibold marker:hidden [&::-webkit-details-marker]:hidden';

  const description = (
    <article>
      <h1 className="text-xl font-semibold leading-snug tracking-tight">{problem.title}</h1>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <DifficultyBadge difficulty={problem.difficulty} />
        <Link href={`/topics/${problem.topic.slug}`} className={`${pill} hover:text-ink`}>{problem.topic.name}</Link>
        <span className={pill}>{TYPE_LABEL[problem.type]}</span>
        <span className={pill}>{problem.estimatedMinutes} min</span>
        {progress?.status === 'COMPLETED' && <span className="rounded-full bg-easy/12 px-2.5 py-0.5 text-xs font-semibold text-easy">Completed</span>}
      </div>

      <section aria-label="Problem statement" className="mt-5">
        <Markdown>{problem.description}</Markdown>
      </section>

      <div className="mt-6">
        <Hints hints={problem.hints} />
      </div>

      <div className="mt-6 divide-y divide-line border-y border-line">
        {problem.roles.length > 0 && (
          <details className="py-3">
            <summary className={sectionTitle}>Relevant roles</summary>
            <ul className="mt-3 flex flex-wrap gap-2">
              {problem.roles.map((r) => (
                <li key={r} className={pill}>{r}</li>
              ))}
            </ul>
          </details>
        )}
        {problem.subcategory && (
          <details className="py-3">
            <summary className={sectionTitle}>Subcategory</summary>
            <p className="mt-2 text-sm text-muted">{problem.subcategory}</p>
          </details>
        )}
        {problem.related.length > 0 && (
          <details className="py-3">
            <summary className={sectionTitle}>Related questions</summary>
            <ul className="mt-3 space-y-2 text-sm">
              {problem.related.map((r) => (
                <li key={r.slug} className="flex items-center justify-between gap-3">
                  <Link href={`/problems/${r.slug}`} className="hover:text-accent">{r.title}</Link>
                  <DifficultyBadge difficulty={r.difficulty} />
                </li>
              ))}
            </ul>
          </details>
        )}
      </div>
    </article>
  );

  const solutionPane = (
    <section aria-labelledby="solution-heading">
      <h2 id="solution-heading" className="text-lg font-semibold">Expert solution</h2>
      {solution ? (
        <div className="mt-4">
          <p className="mb-5 text-sm text-muted">
            {solution.reviewedAt
              ? `Reviewed${solution.reviewedBy ? ` by ${solution.reviewedBy}` : ''} on ${solution.reviewedAt.toLocaleDateString('en-IN', { dateStyle: 'medium' })}.`
              : 'This solution has not been expert-reviewed yet. Check important details against other sources.'}
          </p>
          <Markdown>{solution.content}</Markdown>
          <div className="mt-8 border-t border-line pt-5">
            <CompleteToggle problemId={problem.id} completed={progress?.status === 'COMPLETED'} />
          </div>
        </div>
      ) : unlocked ? (
        <p className="mt-4 text-muted">A solution for this problem hasn&rsquo;t been published yet.</p>
      ) : (
        <div className="mt-4 flex flex-col items-start gap-3 rounded-lg bg-surface-2 px-5 py-6">
          <p className="flex items-center gap-2 font-medium">
            <Lock width={18} height={18} /> Locked until you attempt this problem
          </p>
          <p className="text-sm text-muted">
            {user
              ? 'Submit your answer on the right to unlock the reference solution.'
              : 'Log in and submit an answer to unlock the reference solution.'}
          </p>
          {user && problem.allowDirectReveal && <RevealButton problemId={problem.id} />}
        </div>
      )}
    </section>
  );

  const communityPane = (
    <section aria-labelledby="community-heading">
      <h2 id="community-heading" className="text-lg font-semibold">Community solutions</h2>
      {community ? (
        <CommunitySection data={community} slug={slug} />
      ) : (
        <p className="mt-4 flex items-center gap-2 text-sm text-muted">
          <Lock width={16} height={16} />
          {user
            ? 'Community answers unlock after you submit an attempt or reveal the solution.'
            : 'Log in and attempt this problem to read how other learners answered it.'}
        </p>
      )}
    </section>
  );

  const tabs = [
    { id: 'description', label: 'Description', icon: <FileText width={16} height={16} />, content: description },
    { id: 'solution', label: 'Solution', icon: unlocked ? <Flask width={16} height={16} /> : <Lock width={15} height={15} />, content: solutionPane },
    { id: 'community', label: 'Community', icon: <Users width={16} height={16} />, content: communityPane },
  ];

  const arrow = 'grid h-8 w-8 place-items-center rounded-md text-ink transition-colors hover:bg-surface';
  const arrowOff = 'grid h-8 w-8 place-items-center rounded-md text-muted opacity-40';

  return (
    <div data-workspace className="flex flex-col bg-canvas px-2 pb-2 lg:h-[calc(100dvh-3.5rem)]">
      {/* Top bar: problem list, previous / next, timer */}
      <div className="flex h-12 shrink-0 items-center justify-between gap-2">
        <div className="flex items-center gap-1">
          <Link href="/problems" className="inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm font-semibold transition-colors hover:bg-surface">
            <List width={18} height={18} /> Problem List
          </Link>
          {neighbors.prev ? (
            <Link href={`/problems/${neighbors.prev}`} className={arrow} aria-label="Previous problem" title="Previous problem">
              <ChevronLeft width={18} height={18} />
            </Link>
          ) : (
            <span className={arrowOff} aria-hidden="true"><ChevronLeft width={18} height={18} /></span>
          )}
          {neighbors.next ? (
            <Link href={`/problems/${neighbors.next}`} className={arrow} aria-label="Next problem" title="Next problem">
              <ChevronRight width={18} height={18} />
            </Link>
          ) : (
            <span className={arrowOff} aria-hidden="true"><ChevronRight width={18} height={18} /></span>
          )}
        </div>
        <Timer />
        <p className="hidden w-40 text-right text-xs text-muted sm:block">
          {neighbors.index} of {neighbors.total}
        </p>
      </div>

      <Workspace
        leftLabel="Problem"
        rightLabel="Answer"
        left={
          <>
            <nav aria-label="Breadcrumb" className="sr-only">
              <Link href="/problems">Problems</Link> / <Link href={`/topics/${problem.topic.slug}`}>{problem.topic.name}</Link>
            </nav>
            <ProblemTabs tabs={tabs} initial={sp?.cpage ? 'community' : 'description'} />
            <div className="flex shrink-0 items-center justify-between gap-2 border-t border-line px-3 py-1.5">
              <Link href={`/topics/${problem.topic.slug}`} className="rounded-md px-2.5 py-1.5 text-sm font-medium text-muted hover:bg-surface-2 hover:text-ink">
                More in {problem.topic.name}
              </Link>
              <BookmarkButton problemId={problem.id} slug={slug} initial={bookmarked} signedIn={Boolean(user)} />
            </div>
          </>
        }
        right={
          <>
            <div className="flex h-10 shrink-0 items-center gap-2 border-b border-line bg-surface-2 pl-4 pr-20 text-sm font-medium">
              <Code width={16} height={16} className="text-go" /> Answer
            </div>
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
              {user ? (
                <>
                  <AnswerEditor problemId={problem.id} initialContent={submission?.content ?? ''} hasSubmission={Boolean(submission)} />
                  <div className="shrink-0 border-t border-line p-3">
                    <ShareControl problemId={problem.id} hasSubmission={Boolean(submission)} shared={shared} />
                  </div>
                </>
              ) : (
                <div className="flex min-h-[26rem] flex-1 flex-col">
                  <div className="flex-1 px-4 py-3 font-mono text-[0.85rem] text-muted/70">
                    Write your answer here. Your answer is private unless you choose to share it.
                  </div>
                  <div className="shrink-0 border-t border-line bg-surface-2 px-4 py-3 text-sm">
                    You need to{' '}
                    <Link href={loginHref} className="font-semibold text-accent hover:underline">log in</Link>
                    {' / '}
                    <Link href="/register" className="font-semibold text-accent hover:underline">sign up</Link>
                    {' '}to submit an answer and unlock the expert solution.
                  </div>
                </div>
              )}
            </div>
          </>
        }
      />
    </div>
  );
}
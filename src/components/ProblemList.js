import Link from 'next/link';
import DifficultyBadge from './DifficultyBadge';
import { PAGE_SIZE, TYPE_LABEL } from '@/lib/constants';
import { Check, ChevronLeft, ChevronRight } from './icons';

const EDGE = { EASY: 'border-l-easy', MEDIUM: 'border-l-medium', HARD: 'border-l-hard' };
// status | title | topic | type | time | difficulty (the last four only from md up)
const COLS = 'md:grid-cols-[1.5rem_minmax(0,1fr)_11rem_7rem_4.5rem_5.5rem]';

function StatusMark({ status }) {
  if (status === 'COMPLETED') {
    return (
      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-go text-go-ink">
        <Check width={13} height={13} strokeWidth={3} />
        <span className="sr-only">Completed</span>
      </span>
    );
  }
  if (status === 'ATTEMPTED') {
    return (
      <span className="grid h-5 w-5 shrink-0 place-items-center">
        <span className="h-4 w-4 rounded-full border-2 border-accent border-r-transparent" />
        <span className="sr-only">Attempted</span>
      </span>
    );
  }
  return (
    <span className="grid h-5 w-5 shrink-0 place-items-center">
      <span className="h-4 w-4 rounded-full border-2 border-line" />
      <span className="sr-only">Not started</span>
    </span>
  );
}

export function ProblemRow({ problem, status, number }) {
  return (
    <li>
      <Link
        href={`/problems/${problem.slug}`}
        className={`group grid grid-cols-[1.5rem_minmax(0,1fr)_auto] items-center gap-x-3 border-l-[3px] px-4 py-3.5 transition-colors hover:bg-surface-2 ${EDGE[problem.difficulty]} ${COLS}`}
      >
        <StatusMark status={status} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium group-hover:text-accent">
            <span className="mr-1.5 tabular-nums text-muted">{number}.</span>
            {problem.title}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted md:hidden">
            {problem.topic.name} · {TYPE_LABEL[problem.type]} · {problem.estimatedMinutes} min
          </span>
        </span>
        <span className="hidden truncate text-xs text-muted md:block">{problem.topic.name}</span>
        <span className="hidden truncate text-xs text-muted md:block">{TYPE_LABEL[problem.type]}</span>
        <span className="hidden text-xs tabular-nums text-muted md:block">{problem.estimatedMinutes} min</span>
        <span className="text-right">
          <DifficultyBadge difficulty={problem.difficulty} />
        </span>
      </Link>
    </li>
  );
}

export function Pagination({ basePath, page, totalPages, params }) {
  if (totalPages <= 1) return null;
  const href = (p) => {
    const sp = new URLSearchParams(params);
    sp.set('page', String(p));
    return `${basePath}?${sp.toString()}`;
  };
  const arrow = 'grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-ink transition-colors hover:border-muted';
  const off = 'grid h-10 w-10 place-items-center rounded-xl border border-line bg-surface text-muted opacity-40';
  return (
    <nav aria-label="Pagination" className="mt-6 flex items-center justify-center gap-3">
      {page > 1 ? (
        <Link href={href(page - 1)} className={arrow} aria-label="Previous page"><ChevronLeft width={18} height={18} /></Link>
      ) : (
        <span className={off} aria-hidden="true"><ChevronLeft width={18} height={18} /></span>
      )}
      <p className="text-sm text-muted">Page {page} of {totalPages}</p>
      {page < totalPages ? (
        <Link href={href(page + 1)} className={arrow} aria-label="Next page"><ChevronRight width={18} height={18} /></Link>
      ) : (
        <span className={off} aria-hidden="true"><ChevronRight width={18} height={18} /></span>
      )}
    </nav>
  );
}

export default function ProblemList({ result, statusMap = {}, basePath, params }) {
  const { items, page, totalPages } = result;

  if (!items.length) {
    return (
      <div className="rounded-2xl border border-line bg-surface px-6 py-14 text-center">
        <p className="text-base font-semibold">No problems match these filters</p>
        <p className="mt-1 text-sm text-muted">Try a different keyword, or clear the filters to see every problem.</p>
        <Link href={basePath} className="mt-4 inline-block text-sm font-semibold text-accent hover:underline">
          Clear filters
        </Link>
      </div>
    );
  }

  const offset = (page - 1) * PAGE_SIZE;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-line bg-surface">
        <div
          className={`hidden gap-x-3 border-b border-l-[3px] border-line border-l-transparent bg-surface-2/60 px-4 py-2 text-[0.7rem] font-semibold uppercase tracking-wider text-muted md:grid ${COLS}`}
          aria-hidden="true"
        >
          <span />
          <span>Title</span>
          <span>Topic</span>
          <span>Type</span>
          <span>Time</span>
          <span className="text-right">Level</span>
        </div>
        <ul className="divide-y divide-line">
          {items.map((p, i) => (
            <ProblemRow key={p.id} problem={p} status={statusMap[p.id]} number={offset + i + 1} />
          ))}
        </ul>
      </div>
      <Pagination basePath={basePath} page={page} totalPages={totalPages} params={params} />
    </>
  );
}
import Link from 'next/link';
import DifficultyBadge from './DifficultyBadge';
import { PAGE_SIZE, TYPE_LABEL } from '@/lib/constants';
import { Check, ChevronLeft, ChevronRight } from './icons';

function StatusMark({ status }) {
  if (status === 'COMPLETED') {
    return (
      <span className="grid h-5 w-5 shrink-0 place-items-center text-go">
        <Check width={18} height={18} strokeWidth={2.4} />
        <span className="sr-only">Completed</span>
      </span>
    );
  }
  if (status === 'ATTEMPTED') {
    return (
      <span className="grid h-5 w-5 shrink-0 place-items-center">
        <span className="h-3.5 w-3.5 rounded-full border-2 border-accent" />
        <span className="sr-only">Attempted</span>
      </span>
    );
  }
  return <span className="h-5 w-5 shrink-0"><span className="sr-only">Not started</span></span>;
}

export function ProblemRow({ problem, status, number }) {
  return (
    <li>
      <Link
        href={`/problems/${problem.slug}`}
        className="group grid grid-cols-[1.25rem_minmax(0,1fr)_auto] items-center gap-x-3 rounded-lg px-3 py-2.5 transition-colors odd:bg-surface-2/70 hover:bg-surface-2 md:grid-cols-[1.25rem_minmax(0,1fr)_9rem_4.5rem_3.5rem]"
      >
        <StatusMark status={status} />
        <span className="min-w-0">
          <span className="block truncate text-sm font-medium group-hover:text-accent">
            {number}. {problem.title}
          </span>
          <span className="mt-0.5 block truncate text-xs text-muted md:hidden">
            {problem.topic.name} · {TYPE_LABEL[problem.type]} · {problem.estimatedMinutes} min
          </span>
        </span>
        <span className="hidden truncate text-xs text-muted md:block">{TYPE_LABEL[problem.type]}</span>
        <span className="hidden text-xs text-muted md:block">{problem.estimatedMinutes} min</span>
        <span className="text-right">
          <DifficultyBadge difficulty={problem.difficulty} plain />
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
  const arrow = 'grid h-9 w-9 place-items-center rounded-lg bg-surface-2 text-ink hover:bg-line';
  const off = 'grid h-9 w-9 place-items-center rounded-lg bg-surface-2 text-muted opacity-40';
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
      <div className="panel px-6 py-14 text-center">
        <p className="text-base font-semibold">No problems match these filters</p>
        <p className="mt-1 text-sm text-muted">Try a different keyword, or clear the filters to see every problem.</p>
      </div>
    );
  }

  const offset = (page - 1) * PAGE_SIZE;

  return (
    <>
      <ul className="space-y-0.5">
        {items.map((p, i) => (
          <ProblemRow key={p.id} problem={p} status={statusMap[p.id]} number={offset + i + 1} />
        ))}
      </ul>
      <Pagination basePath={basePath} page={page} totalPages={totalPages} params={params} />
    </>
  );
}
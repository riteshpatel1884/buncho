import Link from 'next/link';
import DifficultyBadge from './DifficultyBadge';
import { TYPE_LABEL } from '@/lib/constants';
import { Check } from './icons';

function StatusMark({ status }) {
  if (status === 'COMPLETED') {
    return (
      <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center text-go">
        <Check width={18} height={18} strokeWidth={2.4} />
        <span className="sr-only">Completed</span>
      </span>
    );
  }
  if (status === 'ATTEMPTED') {
    return (
      <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 border-accent/60">
        <span className="sr-only">Attempted</span>
      </span>
    );
  }
  return (
    <span className="mt-0.5 h-6 w-6 shrink-0 rounded-full border-2 border-transparent">
      <span className="sr-only">Not started</span>
    </span>
  );
}

export function ProblemRow({ problem, status }) {
  return (
    <li className="odd:bg-surface-2/60 hover:bg-surface-2">
      <Link href={`/problems/${problem.slug}`} className="group flex items-start gap-3 px-4 py-3">
        <StatusMark status={status} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug group-hover:text-accent">{problem.title}</p>
          <p className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted">
            <span>{problem.topic.name}</span>
            <span>{TYPE_LABEL[problem.type]}</span>
            <span>{problem.estimatedMinutes} min</span>
          </p>
        </div>
        <DifficultyBadge difficulty={problem.difficulty} />
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
  const linkCls = 'rounded-md border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-surface-2';
  return (
    <nav aria-label="Pagination" className="mt-8 flex items-center justify-between">
      {page > 1 ? <Link href={href(page - 1)} className={linkCls}>Previous</Link> : <span />}
      <p className="text-sm text-muted">Page {page} of {totalPages}</p>
      {page < totalPages ? <Link href={href(page + 1)} className={linkCls}>Next</Link> : <span />}
    </nav>
  );
}

export default function ProblemList({ result, statusMap = {}, basePath, params }) {
  const { items, total, page, totalPages } = result;

  if (!items.length) {
    return (
      <div className="rounded-lg border border-dashed border-line px-6 py-14 text-center">
        <p className="font-display text-lg font-semibold">No problems match these filters</p>
        <p className="mt-1 text-muted">Try a different keyword, or clear the filters to see every problem.</p>
      </div>
    );
  }

  return (
    <>
      <p className="mb-2 text-sm text-muted">{total} {total === 1 ? 'problem' : 'problems'}</p>
      <ul className="panel overflow-hidden">
        {items.map((p) => (
          <ProblemRow key={p.id} problem={p} status={statusMap[p.id]} />
        ))}
      </ul>
      <Pagination basePath={basePath} page={page} totalPages={totalPages} params={params} />
    </>
  );
}
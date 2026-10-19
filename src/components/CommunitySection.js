import Link from 'next/link';
import Markdown from './Markdown';
import AnswerCard from './AnswerCard';

export default function CommunitySection({ data, slug }) {
  const { items, total, page, totalPages } = data;
  const href = (p) => `/problems/${slug}?cpage=${p}#community-heading`;
  const pageLink = 'rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold hover:bg-surface-2';

  if (total === 0) {
    return (
      <p className="mt-4 text-muted">
        Nobody else has shared an answer to this problem yet. Share yours from the Your answer section to start the discussion.
      </p>
    );
  }

  return (
    <div className="mt-4">
      <p className="mb-5 text-sm text-muted">
        These answers are written by other learners. Helpful votes show what people found useful. They do not prove an answer is correct, so compare each one with the expert solution.
      </p>

      <div className="space-y-6">
        {items.map((a) => (
          <AnswerCard key={a.id} answer={a}>
            <Markdown>{a.content}</Markdown>
          </AnswerCard>
        ))}
      </div>

      {totalPages > 1 && (
        <nav aria-label="Community answers pages" className="mt-8 flex items-center justify-between">
          {page > 1 ? <Link href={href(page - 1)} className={pageLink}>Previous</Link> : <span />}
          <span className="text-sm text-muted">Page {page} of {totalPages}</span>
          {page < totalPages ? <Link href={href(page + 1)} className={pageLink}>Next</Link> : <span />}
        </nav>
      )}
    </div>
  );
}
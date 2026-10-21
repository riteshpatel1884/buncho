import Link from 'next/link';
import DifficultyBadge from './DifficultyBadge';

function Card({ id, title, hint, children }) {
  return (
    <section aria-labelledby={id} className="panel p-5">
      <h2 id={id} className="text-base font-semibold">{title}</h2>
      {hint && <p className="mt-0.5 text-xs text-muted">{hint}</p>}
      <div className="mt-3">{children}</div>
    </section>
  );
}

const row = 'flex items-center justify-between gap-4 rounded-lg px-3 py-2.5 text-sm odd:bg-surface-2/70 hover:bg-surface-2';

export function Recommended({ items }) {
  return (
    <Card id="recommended" title="Recommended for you" hint="Picked from the areas where you need the most practice.">
      {items.length ? (
        <ul className="-mx-2 space-y-0.5">
          {items.map((p) => (
            <li key={p.slug}>
              <Link href={`/problems/${p.slug}`} className={row}>
                <span className="min-w-0">
                  <span className="block truncate font-medium">
                    {p.title}
                    {p.isChallenge && <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 text-[0.65rem] font-semibold text-accent">Challenge</span>}
                  </span>
                  <span className="block truncate text-xs text-muted">{p.reason}</span>
                </span>
                <DifficultyBadge difficulty={p.difficulty} plain />
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">You&rsquo;ve started every available problem. New ones are added regularly.</p>
      )}
    </Card>
  );
}

export function RevisionQueue({ items }) {
  return (
    <Card id="revision" title="Revision queue" hint="Answers due for another look. Lower scores come back sooner.">
      {items.length ? (
        <ul className="-mx-2 space-y-0.5">
          {items.map((p) => (
            <li key={p.slug}>
              <Link href={`/problems/${p.slug}`} className={row}>
                <span className="min-w-0">
                  <span className="block truncate font-medium">{p.title}</span>
                  <span className="block truncate text-xs text-muted">
                    Scored {p.score}/100 · answered {p.answeredDaysAgo === 0 ? 'today' : `${p.answeredDaysAgo}d ago`}
                  </span>
                </span>
                <span className="shrink-0 text-xs font-semibold text-accent">Revise</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">Nothing is due. Answers you submit will show up here when it&rsquo;s time to revise them.</p>
      )}
    </Card>
  );
}

export function WeakTopics({ items }) {
  return (
    <Card id="weak" title="Focus areas" hint="Topics with the lowest scores, and topics you haven't started.">
      {items.length ? (
        <ul className="space-y-3">
          {items.map((t) => (
            <li key={t.slug}>
              <div className="flex items-center justify-between gap-3 text-sm">
                <Link href={`/topics/${t.slug}`} className="font-medium hover:text-accent">{t.name}</Link>
                <span className="text-xs text-muted">
                  {t.reason === 'low' ? `Average ${t.avg}/100 over ${t.evaluated} ${t.evaluated === 1 ? 'answer' : 'answers'}` : 'Not started'}
                </span>
              </div>
              <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-hard" style={{ width: `${t.avg ?? 0}%` }} />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">No weak areas right now. Keep practising across topics.</p>
      )}
    </Card>
  );
}
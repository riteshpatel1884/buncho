import Link from 'next/link';
import { getNotesTree, notesHref } from '@/lib/notes';
import NotesTree, { FileIcon, FolderIcon } from '@/components/blog/NotesTree';
import { formatDateIST } from '@/lib/datetime';

export const metadata = {
  title: 'Coding notes',
  description: 'Folders of practical coding notes for Python, NumPy, Pandas, SQL, JavaScript and more, with runnable snippets and their output.',
};

const rowCls = 'grid items-center gap-x-4 px-4 py-2.5 text-sm transition-colors hover:bg-surface-2/70 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.6fr)_6.5rem]';

function Row({ to, icon, name, badge, note, meta, muted }) {
  return (
    <li>
      <Link href={to} prefetch={false} className={rowCls}>
        <span className="flex min-w-0 items-center gap-2.5 font-medium">
          <span className={`shrink-0 ${muted ? 'text-muted' : 'text-accent'}`}>{icon}</span>
          <span className="truncate hover:underline">{name}</span>
          {badge && <span className="hidden shrink-0 rounded-full bg-accent-soft px-2 py-0.5 text-[0.68rem] font-semibold text-accent md:inline">{badge}</span>}
        </span>
        <span className="hidden truncate text-muted sm:block">{note}</span>
        <span className="hidden text-right text-xs text-muted sm:block">{meta}</span>
      </Link>
    </li>
  );
}

export default async function NotesPage({ searchParams }) {
  const { c } = await searchParams;
  const tree = await getNotesTree();
  const total = tree.reduce((n, cat) => n + cat.count, 0);

  // The topic folder being opened. An unknown value falls back to the list of all topics.
  const cat = tree.find((x) => x.slug === c) ?? null;

  const crumbs = [{ name: 'notes', to: cat ? notesHref() : null }];
  if (cat) crumbs.push({ name: cat.name, to: null });

  return (
    <div className="mx-auto w-full max-w-[110rem] px-4 pb-20 pt-8 sm:px-6">
      <header className="mb-6 max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">{'</>'} Coding notes</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Notes, organised like a repo</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          Pick a topic folder on the left, then open any subtopic inside it. Every note has runnable code, the output it prints and the mistakes to avoid.
          {total > 0 && <span className="text-ink"> {total} {total === 1 ? 'note' : 'notes'} in {tree.length} {tree.length === 1 ? 'folder' : 'folders'}.</span>}
        </p>
      </header>

      {tree.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-8 text-center text-muted">No coding notes are published yet.</p>
      ) : (
        <div className="grid items-start gap-6 lg:grid-cols-[17rem_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-20" aria-label="Topic folders">
            {/* Explorer: topic folders only. Their files appear in the main column when a folder is opened. */}
            <NotesTree tree={tree} selected={cat?.slug ?? null} topicHref={notesHref} />
          </aside>

          <main className="min-w-0">
            <nav aria-label="Folder path" className="mb-3 flex flex-wrap items-center gap-x-1 font-mono text-[0.85rem] text-muted">
              {crumbs.map((p, i) => (
                <span key={p.name} className="flex items-center gap-1">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  {p.to ? <Link href={p.to} className="rounded px-1 py-0.5 text-accent hover:bg-accent-soft hover:underline">{p.name}</Link> : <span className="px-1 py-0.5 font-semibold text-ink">{p.name}</span>}
                </span>
              ))}
            </nav>

            <div className="overflow-hidden rounded-xl border border-line bg-surface">
              <div className="flex items-center gap-3 border-b border-line bg-surface-2/70 px-4 py-2.5 text-sm">
                <span className="font-semibold">{cat ? cat.name : 'All folders'}</span>
                <span className="rounded-full bg-surface px-2 py-0.5 text-xs font-semibold text-muted">{cat ? cat.count : tree.length}</span>
                <span className="ml-auto hidden text-xs text-muted sm:block">{cat ? 'Name · Summary · Updated' : 'Folders'}</span>
              </div>

              <ul className="divide-y divide-line">
                {/* No topic chosen: every topic is a folder row */}
                {!cat && tree.map((x) => (
                  <Row key={x.slug} to={notesHref(x.slug)} icon={<FolderIcon />} name={x.name} note={x.description} meta={`${x.count} ${x.count === 1 ? 'note' : 'notes'}`} />
                ))}

                {/* Topic chosen: "..", then every file (one per subtopic) in reading order */}
                {cat && <Row to={notesHref()} icon={<FolderIcon />} name=".." note="" meta="" muted />}
                {cat && cat.files.map((x) => (
                  <Row
                    key={x.slug}
                    to={`/blog/${x.slug}`}
                    icon={<FileIcon />}
                    name={x.title}
                    badge={x.section}
                    note={x.excerpt || (x.minutes ? `${x.minutes} min read` : '')}
                    meta={x.updated ? formatDateIST(x.updated) : ''}
                  />
                ))}
              </ul>
            </div>

            {cat && cat.description && (
              <p className="mt-4 rounded-xl border border-line bg-surface px-4 py-3 text-sm leading-relaxed text-muted">{cat.description}</p>
            )}
          </main>
        </div>
      )}
    </div>
  );
}
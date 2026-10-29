import Link from 'next/link';
import { getNotesTree } from '@/lib/notes';
import { FileIcon, FolderIcon } from '@/components/blog/NotesTree';

export const metadata = {
  title: 'Coding notes',
  description: 'Folders of practical coding notes for Python, SQL, JavaScript and more, with runnable snippets and their output.',
};
export const revalidate = 300;

export default async function NotesPage() {
  const tree = await getNotesTree();
  const files = tree.reduce((n, c) => n + c.count, 0);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-20 pt-10 sm:px-6">
      <header className="max-w-2xl">
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">{'</>'} Coding notes</p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Notes, organised like a repo</h1>
        <p className="mt-3 text-lg leading-relaxed text-muted">
          Pick a folder, open a file. Every note has runnable code, the output it prints and the mistakes to avoid.
          {files > 0 && <span className="text-ink"> {files} {files === 1 ? 'note' : 'notes'} in {tree.length} {tree.length === 1 ? 'folder' : 'folders'}.</span>}
        </p>
      </header>

      {tree.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-line p-8 text-center text-muted">No coding notes are published yet.</p>
      ) : (
        <div className="mt-10 grid gap-5 md:grid-cols-2">
          {tree.map((cat) => (
            <section key={cat.slug} id={cat.slug} aria-labelledby={`h-${cat.slug}`} className="notes-tree scroll-mt-24 overflow-hidden rounded-2xl border border-line bg-surface">
              <div className="flex items-start gap-3 border-b border-line bg-surface-2/60 px-5 py-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent-soft text-accent"><FolderIcon width="20" height="20" /></span>
                <div className="min-w-0">
                  <h2 id={`h-${cat.slug}`} className="text-lg font-semibold leading-tight">{cat.name}</h2>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted">{cat.description}</p>
                </div>
                <span className="ml-auto rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-muted">{cat.count}</span>
              </div>
              <div className="space-y-1 p-3">
                <ul className="!m-0 !border-0 !p-0">
                  {cat.files.map((f) => (
                    <li key={f.slug}>
                      <Link href={`/blog/${f.slug}`} prefetch={false}>
                        <FileIcon className="shrink-0" /><span className="truncate">{f.title}</span>{f.minutes ? <span className="notes-count">{f.minutes}m</span> : null}
                      </Link>
                    </li>
                  ))}
                </ul>
                {cat.folders.map((folder) => (
                  <details key={folder.name} open={cat.folders.length <= 3}>
                    <summary>
                      <FolderIcon className="shrink-0 opacity-70" /><span className="truncate">{folder.name}</span><span className="notes-count">{folder.files.length}</span>
                      <svg className="chev" viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m8 5 5 5-5 5" /></svg>
                    </summary>
                    <ul>
                      {folder.files.map((f) => (
                        <li key={f.slug}>
                          <Link href={`/blog/${f.slug}`} prefetch={false}>
                            <FileIcon className="shrink-0" /><span className="truncate">{f.title}</span>{f.minutes ? <span className="notes-count">{f.minutes}m</span> : null}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </details>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
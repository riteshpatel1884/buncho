import Link from 'next/link';

export const FolderIcon = (props) => (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h4l1.6 1.8h7.4A1.5 1.5 0 0 1 18 7.3v7.2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 14.5v-9Z" />
  </svg>
);

export const FolderOpenIcon = (props) => (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h4l1.6 1.8h6.4A1.5 1.5 0 0 1 17 7.3V8H5.4a1.5 1.5 0 0 0-1.43 1.05L2 14.9V5.5Z" />
    <path d="M5.4 9h12.3a.8.8 0 0 1 .76 1.04l-1.7 5.2a1.5 1.5 0 0 1-1.43 1.04H3.5a.8.8 0 0 1-.76-1.04l1.7-5.2A1.5 1.5 0 0 1 5.4 9Z" opacity=".75" />
  </svg>
);

export const FileIcon = (props) => (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden="true" {...props}>
    <path d="M5.5 2.5h6L15 6v11a.5.5 0 0 1-.5.5h-9A.5.5 0 0 1 5 17V3a.5.5 0 0 1 .5-.5Z" />
    <path d="M11.5 2.5V6H15" />
  </svg>
);

const Chevron = () => (
  <svg className="chev" viewBox="0 0 20 20" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="m8 5 5 5-5 5" />
  </svg>
);

/** A folder icon that switches between closed and open with the <details> state (CSS only). */
const FolderGlyph = ({ className = '' }) => (
  <span className={`fico ${className}`} aria-hidden="true">
    <FolderIcon className="fico-closed" />
    <FolderOpenIcon className="fico-open" />
  </span>
);

export function FileRow({ f, current }) {
  const active = f.slug === current?.slug;
  // A draft has no public page yet, so it is shown as the current file but is not a link
  if (f.draft) {
    return (
      <li>
        <span className="notes-file is-current" aria-current="page">
          <FileIcon className="shrink-0" />
          <span className="truncate">{f.title}</span>
          <span className="notes-draft">draft</span>
        </span>
      </li>
    );
  }
  return (
    <li>
      {/* prefetch off: a long tree would otherwise prefetch every note on the page */}
      <Link href={`/blog/${f.slug}`} prefetch={false} aria-current={active ? 'page' : undefined}>
        <FileIcon className="shrink-0" />
        <span className="truncate">{f.title}</span>
        {f.minutes ? <span className="notes-count">{f.minutes}m</span> : null}
      </Link>
    </li>
  );
}

/**
 * Explorer for the coding notes. Two layouts, both server-rendered with no JavaScript:
 *
 *  - Topics only (pass `topicHref`, used on /notes): one row per topic folder (Python, NumPy, Pandas...). Clicking a
 *    topic opens it in the main column, so the files are NOT listed here. `selected` is the topic slug being shown.
 *  - Topics with files (no `topicHref`, used beside a note): each topic is a folder that opens to its files; the
 *    topic of the current note starts open.
 */
export default function NotesTree({ tree, current, selected = null, topicHref, title = 'Explorer' }) {
  return (
    <nav className="notes-tree" aria-label="Coding notes topics">
      <div className="notes-tree-head">
        <FolderIcon className="text-accent" />
        <span>{title}</span>
        <Link href="/notes" prefetch={false}>All notes</Link>
      </div>

      <div className="notes-tree-body">
        {!tree?.length && <p className="px-3 py-4 text-sm text-muted">No notes yet.</p>}

        {topicHref ? (
          <ul className="notes-topics">
            {tree?.map((cat) => (
              <li key={cat.slug}>
                <Link href={topicHref(cat.slug)} prefetch={false} aria-current={selected === cat.slug ? 'page' : undefined}>
                  <FolderGlyph className="text-accent" />
                  <span className="truncate">{cat.name}</span>
                  <span className="notes-count">{cat.count}</span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          tree?.map((cat) => (
            <div key={cat.slug} className="notes-node">
              <details open={current?.category === cat.slug}>
                <summary>
                  <FolderGlyph className="text-accent" />
                  <span className="truncate">{cat.name}</span>
                  <span className="notes-count">{cat.count}</span>
                  <Chevron />
                </summary>
                <ul>{cat.files.map((f) => <FileRow key={f.slug} f={f} current={current} />)}</ul>
              </details>
            </div>
          ))
        )}
      </div>
    </nav>
  );
}
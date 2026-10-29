import Link from 'next/link';

export const FolderIcon = (props) => (
  <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor" aria-hidden="true" {...props}>
    <path d="M2 5.5A1.5 1.5 0 0 1 3.5 4h4l1.6 1.8h7.4A1.5 1.5 0 0 1 18 7.3v7.2a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 2 14.5v-9Z" />
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

export function FileRow({ f, current }) {
  return (
    <li>
      {/* prefetch off: a long tree would otherwise prefetch every note on the page */}
      <Link href={`/blog/${f.slug}`} prefetch={false} aria-current={f.slug === current?.slug ? 'page' : undefined}>
        <FileIcon className="shrink-0" />
        <span className="truncate">{f.title}</span>
        {f.minutes ? <span className="notes-count">{f.minutes}m</span> : null}
      </Link>
    </li>
  );
}

/**
 * Folder tree of all coding notes (category > folder > file), like a repository browser. Plain server-rendered
 * <details> elements, so it opens and closes with no JavaScript. The folders around the current note start open.
 */
export default function NotesTree({ tree, current }) {
  if (!tree?.length) return null;
  return (
    <nav className="notes-tree" aria-label="Coding notes folders">
      {tree.map((cat) => {
        const here = current?.category === cat.slug;
        return (
          <details key={cat.slug} open={here}>
            <summary>
              <FolderIcon className="shrink-0 text-accent" />
              <span className="truncate">{cat.name}</span>
              <span className="notes-count">{cat.count}</span>
              <Chevron />
            </summary>
            <ul>
              {cat.files.map((f) => <FileRow key={f.slug} f={f} current={current} />)}
              {cat.folders.map((folder) => (
                <li key={folder.name}>
                  <details open={here && current?.folder === folder.name}>
                    <summary>
                      <FolderIcon className="shrink-0 opacity-70" />
                      <span className="truncate">{folder.name}</span>
                      <span className="notes-count">{folder.files.length}</span>
                      <Chevron />
                    </summary>
                    <ul>{folder.files.map((f) => <FileRow key={f.slug} f={f} current={current} />)}</ul>
                  </details>
                </li>
              ))}
            </ul>
          </details>
        );
      })}
      <Link href="/notes" prefetch={false} className="notes-all">Browse all notes →</Link>
    </nav>
  );
}
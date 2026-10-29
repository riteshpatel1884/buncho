import Link from 'next/link';
import { buildHeadingIndex, codeStats } from '@/lib/blog-content';
import { CATEGORY_BY_SLUG, RESOURCE_LABEL } from '@/lib/blog-constants';
import { DIFFICULTY_LABEL } from '@/lib/constants';
import { absoluteUrl } from '@/lib/seo';
import { getNotesTree, withCurrent, neighbours, notesHref, UNFILED } from '@/lib/notes';
import Breadcrumbs from './Breadcrumbs';
import RichContent from './RichContent';
import ReadingProgress from './ReadingProgress';
import PostSidebar from './PostSidebar';
import Engagement from './Engagement';
import Comments from './Comments';
import ViewTracker from './ViewTracker';
import NotesTree, { FileIcon, FolderIcon } from './NotesTree';

const DIFF_BADGE = { EASY: 'bg-easy/12 text-easy', MEDIUM: 'bg-medium/12 text-medium', HARD: 'bg-hard/12 text-hard' };

/* ---------- small shared sections (used by both the blog layout and the notes layout) ---------- */

function Takeaways({ items }) {
  if (!items?.length) return null;
  return (
    <section aria-labelledby="takeaways-heading" className="mt-6 rounded-xl border border-line bg-accent-soft/50 p-5">
      <h2 id="takeaways-heading" className="text-sm font-semibold uppercase tracking-wider text-accent">Key takeaways</h2>
      <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[0.95rem] leading-relaxed">
        {items.map((t) => <li key={t}>{t}</li>)}
      </ul>
    </section>
  );
}

function Resources({ items }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="resources-heading" className="mt-10 rounded-xl border border-line bg-surface p-5">
      <h2 id="resources-heading" className="text-lg font-semibold">Practical resources</h2>
      <ul className="mt-3 space-y-2 text-sm">
        {items.map((r) => (
          <li key={r.url} className="flex flex-wrap items-baseline gap-2">
            <span className="rounded bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">{RESOURCE_LABEL[r.type] ?? 'Link'}</span>
            <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-medium text-accent underline underline-offset-4">{r.label}</a>
          </li>
        ))}
      </ul>
    </section>
  );
}

function Practice({ items }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="practice-heading" className="mt-10 rounded-xl border border-line bg-surface p-5">
      <h2 id="practice-heading" className="text-lg font-semibold">Practice what you learned</h2>
      <p className="mt-1 text-sm text-muted">Try these interview questions on the same topic and get AI feedback on your answers.</p>
      <ul className="mt-4 space-y-2">
        {items.map((p) => (
          <li key={p.id}>
            <Link href={`/problems/${p.slug}`} className="flex items-center gap-3 rounded-lg border border-line px-4 py-3 transition-colors hover:border-accent/60 hover:bg-surface-2">
              <span className="min-w-0 flex-1">
                <span className="block font-medium leading-snug">{p.title}</span>
                <span className="mt-0.5 block text-xs text-muted">{p.topic?.name}{p.estimatedMinutes ? ` · ~${p.estimatedMinutes} min` : ''}</span>
              </span>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${DIFF_BADGE[p.difficulty]}`}>{DIFFICULTY_LABEL[p.difficulty]}</span>
              <span aria-hidden="true" className="text-muted">→</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function PrevNext({ prev, next }) {
  if (!prev && !next) return null;
  return (
    <nav aria-label="Previous and next note" className="mt-8 grid gap-3 sm:grid-cols-2">
      {prev ? (
        <Link href={`/blog/${prev.slug}`} className="rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent/60 hover:bg-surface-2">
          <span className="text-xs text-muted">← Previous{prev.section ? ` · ${prev.section}` : ''}</span>
          <span className="mt-1 block font-semibold leading-snug">{prev.title}</span>
        </Link>
      ) : <span />}
      {next && (
        <Link href={`/blog/${next.slug}`} className="rounded-xl border border-line bg-surface p-4 text-right transition-colors hover:border-accent/60 hover:bg-surface-2">
          <span className="text-xs text-muted">Next{next.section ? ` · ${next.section}` : ''} →</span>
          <span className="mt-1 block font-semibold leading-snug">{next.title}</span>
        </Link>
      )}
    </nav>
  );
}

function Footer({ post, preview, viewer, helpfulCounts, comments, loginHref }) {
  return (
    <>
      {!preview ? (
        <>
          <Engagement
            postId={post.id}
            signedIn={Boolean(viewer.signedIn)}
            loginHref={loginHref}
            liked={Boolean(viewer.liked)}
            likes={post._count.likes}
            helpful={viewer.helpful ?? null}
            yes={helpfulCounts.yes}
            no={helpfulCounts.no}
          />
          <Comments postId={post.id} initial={comments} signedIn={Boolean(viewer.signedIn)} loginHref={loginHref} />
        </>
      ) : (
        <p className="mt-12 rounded-lg border border-dashed border-line p-4 text-sm text-muted">
          Likes, feedback and comments appear here once the article is live.
        </p>
      )}
      <p className="mt-10 text-sm text-muted">
        Practising for an AI or ML interview? <Link href="/problems" className="font-semibold text-accent underline underline-offset-4">Try the interview questions</Link> and get AI feedback on your answers.
      </p>
    </>
  );
}

/** "notes / Python / 00_python" - the topic is a link into its folder view, like a repo path bar. */
function PathBar({ category, name }) {
  const part = 'rounded px-1 py-0.5 text-accent hover:bg-accent-soft hover:underline';
  return (
    <nav aria-label="File path" className="flex min-w-0 flex-wrap items-center gap-x-1 gap-y-0.5 font-mono text-[0.85rem] text-muted">
      <Link href="/notes" className={part}>notes</Link>
      <span aria-hidden="true">/</span>
      {category ? <Link href={notesHref(category.slug)} className={part}>{category.name}</Link> : <span className="px-1 py-0.5">unfiled</span>}
      <span aria-hidden="true">/</span>
      <span aria-current="page" className="max-w-[18rem] truncate px-1 py-0.5 font-semibold text-ink sm:max-w-md">{name}</span>
    </nav>
  );
}

/**
 * The whole article page body. Used by the public route and by the admin preview, so what an editor previews is
 * exactly what readers get. `preview` hides anything that writes data (views, likes, comments).
 *
 * Blog articles: article on the left, details on the right.
 * Coding notes (GitHub-style): [ folder explorer | the note | author + post details ].
 */
export default async function ArticleView({ post, related = [], practice = [], viewer = {}, helpfulCounts = { yes: 0, no: 0 }, comments = [], preview = false }) {
  const category = CATEGORY_BY_SLUG[post.category];
  const coding = post.kind === 'CODING';
  const headings = buildHeadingIndex(post.content);
  const url = absoluteUrl(`/blog/${post.slug}`);
  const loginHref = `/login?redirect_url=${encodeURIComponent(`/blog/${post.slug}`)}`;
  const resources = Array.isArray(post.resources) ? post.resources : [];
  const footer = <Footer post={post} preview={preview} viewer={viewer} helpfulCounts={helpfulCounts} comments={comments} loginHref={loginHref} />;
  const sidebar = <PostSidebar post={post} url={url} related={related} helpfulCounts={helpfulCounts} />;

  /* ---------------------------- Blog article layout (unchanged) ---------------------------- */
  if (!coding) {
    const crumbs = [
      { name: 'Home', href: '/' },
      { name: 'Blog', href: '/blog' },
      ...(category ? [{ name: category.name, href: `/blog/category/${category.slug}` }] : []),
      { name: post.title },
    ];
    return (
      <div className="mx-auto w-full max-w-[84rem] px-4 pb-16 pt-6 sm:px-6">
        <ReadingProgress />
        {!preview && <ViewTracker slug={post.slug} />}
        <div className="mx-auto w-full max-w-[72rem]">
          <header className="max-w-[48rem]">
            <Breadcrumbs items={crumbs} />
            {category && <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-accent">{category.group} / {category.name}</p>}
            <h1 className="mt-2 max-w-[48rem] text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
            {post.excerpt && <p className="mt-3 max-w-[48rem] text-lg leading-relaxed text-muted">{post.excerpt}</p>}
          </header>
          <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,48rem)_20rem]">
            <article className="min-w-0" id="article-body">
              <Takeaways items={post.keyTakeaways} />
              <div className="mt-8"><RichContent doc={post.content} headings={headings} /></div>
              <Resources items={resources} />
              <Practice items={practice} />
              {footer}
            </article>
            <aside className="xl:sticky xl:top-20 xl:max-h-[calc(100dvh-6rem)] xl:self-start xl:overflow-y-auto xl:overscroll-contain xl:pr-1" aria-label="Article information">
              {sidebar}
            </aside>
          </div>
        </div>
      </div>
    );
  }

  /* ---------------------------- Coding notes layout (file browser) ---------------------------- */
  // The viewed note is always part of the tree, even as a draft in the preview, so the explorer is never empty
  const tree = withCurrent(await getNotesTree(), post);
  const here = { slug: post.slug, category: category?.kind === 'CODING' ? post.category : UNFILED };
  const { prev, next } = neighbours(tree, here);
  const stats = codeStats(post.content);

  return (
    <div className="mx-auto w-full max-w-[110rem] px-4 pb-16 pt-5 sm:px-6">
      <ReadingProgress />
      {!preview && <ViewTracker slug={post.slug} />}

      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-accent-soft text-accent" aria-hidden="true"><FolderIcon width="15" height="15" /></span>
        <PathBar category={category?.kind === 'CODING' ? category : null} name={post.slug} />
        <span className="ml-auto rounded-full border border-line bg-surface px-2.5 py-0.5 font-mono text-xs text-muted">{'</>'} Coding notes</span>
      </div>

      {/* Three columns from 1280px: explorer | note | details. Every column is always rendered, so nothing can slide into the wrong track. */}
      <div className="grid items-start gap-6 xl:grid-cols-[17rem_minmax(0,1fr)_19rem]">
        <aside className="hidden xl:sticky xl:top-20 xl:block" aria-label="Folders">
          <NotesTree tree={tree} current={here} />
        </aside>

        <article className="min-w-0" id="article-body">
          <details className="notes-drawer xl:hidden">
            <summary>
              <FileIcon className="shrink-0 text-accent" />
              <span className="truncate">Browse notes{category ? ` · ${category.name}` : ''}</span>
            </summary>
            <div className="p-2"><NotesTree tree={tree} current={here} /></div>
          </details>

          {/* The file viewer: a header bar like GitHub's, then the note itself */}
          <div className="overflow-hidden rounded-xl border border-line bg-surface">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-line bg-surface-2/70 px-4 py-2.5 text-sm">
              <span className="flex min-w-0 items-center gap-2 font-mono text-[0.8rem] font-semibold">
                <FileIcon className="shrink-0 text-accent" />
                <span className="truncate">{post.slug}</span>
              </span>
              <span className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted sm:ml-auto">
                <span>{post.readingMinutes} min read</span>
                <span>{stats.blocks} code {stats.blocks === 1 ? 'block' : 'blocks'}</span>
                <span>{stats.lines} lines of code</span>
              </span>
            </div>

            <div className="px-5 pb-8 pt-6 sm:px-8">
              <h1 className="text-3xl font-bold leading-tight tracking-tight sm:text-[2.1rem]">{post.title}</h1>
              {post.excerpt && <p className="mt-2 text-lg leading-relaxed text-muted">{post.excerpt}</p>}
              <Takeaways items={post.keyTakeaways} />
              <div className="mt-7"><RichContent doc={post.content} headings={headings} variant="notes" /></div>
            </div>
          </div>

          <PrevNext prev={prev} next={next} />
          <Resources items={resources} />
          <Practice items={practice} />
          {footer}
        </article>

        {/* Author and post details, unchanged. Stays in view on wide screens and scrolls on its own when taller than the window. */}
        <aside className="xl:sticky xl:top-20 xl:max-h-[calc(100dvh-6rem)] xl:overflow-y-auto xl:overscroll-contain xl:pr-1" aria-label="Article information">
          {sidebar}
        </aside>
      </div>
    </div>
  );
}
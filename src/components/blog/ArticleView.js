import Link from 'next/link';
import { buildHeadingIndex, codeStats } from '@/lib/blog-content';
import { CATEGORY_BY_SLUG, RESOURCE_LABEL } from '@/lib/blog-constants';
import { DIFFICULTY_LABEL } from '@/lib/constants';
import { absoluteUrl } from '@/lib/seo';
import { getNotesTree, neighbours } from '@/lib/notes';
import Breadcrumbs from './Breadcrumbs';
import RichContent from './RichContent';
import ReadingProgress from './ReadingProgress';
import PostSidebar from './PostSidebar';
import Engagement from './Engagement';
import Comments from './Comments';
import ViewTracker from './ViewTracker';
import NotesTree, { FileIcon } from './NotesTree';

const DIFF_BADGE = { EASY: 'bg-easy/12 text-easy', MEDIUM: 'bg-medium/12 text-medium', HARD: 'bg-hard/12 text-hard' };

/**
 * The whole article page body. Used by the public route and by the admin preview, so what an editor previews is
 * exactly what readers get. `preview` hides anything that writes data (views, likes, comments).
 */
export default async function ArticleView({ post, related = [], practice = [], viewer = {}, helpfulCounts = { yes: 0, no: 0 }, comments = [], preview = false }) {
  const category = CATEGORY_BY_SLUG[post.category];
  const coding = post.kind === 'CODING';
  // Coding notes get a file-browser layout: folder tree on the left, the note in the middle, "on this page" on the right
  const tree = coding ? await getNotesTree() : null;
  const stats = coding ? codeStats(post.content) : null;
  const { prev, next } = coding ? neighbours(tree, post) : {};
  const here = { slug: post.slug, category: post.category, folder: post.folder ?? '' };
  const headings = buildHeadingIndex(post.content);
  const url = absoluteUrl(`/blog/${post.slug}`);
  const loginHref = `/login?redirect_url=${encodeURIComponent(`/blog/${post.slug}`)}`;
  const resources = Array.isArray(post.resources) ? post.resources : [];

  const crumbs = [
    { name: 'Home', href: '/' },
    coding ? { name: 'Notes', href: '/notes' } : { name: 'Blog', href: '/blog' },
    ...(category ? [{ name: category.name, href: coding ? `/notes#${category.slug}` : `/blog/category/${category.slug}` }] : []),
    { name: post.title },
  ];

  return (
    <div className="mx-auto w-full max-w-[84rem] px-4 pb-16 pt-6 sm:px-6">
      <ReadingProgress />
      {!preview && <ViewTracker slug={post.slug} />}

      <div className={`mx-auto w-full ${coding ? 'max-w-[96rem]' : 'max-w-[72rem]'}`}>
      <header className={coding ? 'max-w-[52rem] xl:ml-[18rem]' : 'max-w-[48rem]'}>
        <Breadcrumbs items={crumbs} />
        {category && (
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-accent">
            {category.group} / {category.name}
            {coding && <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 font-mono normal-case tracking-normal">{'</>'} Coding notes</span>}
          </p>
        )}
        <h1 className="mt-2 max-w-[48rem] text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
        {post.excerpt && <p className="mt-3 max-w-[48rem] text-lg leading-relaxed text-muted">{post.excerpt}</p>}
        {coding && (
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 rounded-xl border border-line bg-surface px-4 py-3 text-sm">
            <span className="flex min-w-0 items-center gap-2 font-mono text-[0.8rem] text-muted">
              <FileIcon className="shrink-0 text-accent" />
              <span className="truncate">{[category?.name, post.folder, post.slug].filter(Boolean).join(' / ')}</span>
            </span>
            <span className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted sm:ml-auto">
              <span>{post.readingMinutes} min read</span>
              <span>{stats.blocks} code {stats.blocks === 1 ? 'block' : 'blocks'}</span>
              <span>{stats.lines} lines of code</span>
            </span>
          </div>
        )}
      </header>

      <div className={`mt-8 grid gap-8 ${coding ? 'xl:grid-cols-[16rem_minmax(0,1fr)_18rem]' : 'xl:grid-cols-[minmax(0,48rem)_20rem]'}`}>
        {coding && tree.length > 0 && (
          <aside className="hidden xl:sticky xl:top-20 xl:block xl:max-h-[calc(100dvh-6rem)] xl:self-start xl:overflow-y-auto xl:overscroll-contain xl:pr-1" aria-label="Folders">
            <NotesTree tree={tree} current={here} />
          </aside>
        )}
        <article className="min-w-0" id="article-body">
          {coding && tree.length > 0 && (
            <details className="notes-drawer xl:hidden">
              <summary>
                <FileIcon className="shrink-0 text-accent" />
                <span className="truncate">Browse notes{category ? ` · ${category.name}` : ''}</span>
              </summary>
              <div className="p-2"><NotesTree tree={tree} current={here} /></div>
            </details>
          )}
          {post.keyTakeaways?.length > 0 && (
            <section aria-labelledby="takeaways-heading" className="mt-8 rounded-xl border border-line bg-accent-soft/50 p-5">
              <h2 id="takeaways-heading" className="text-sm font-semibold uppercase tracking-wider text-accent">Key takeaways</h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[0.95rem] leading-relaxed">
                {post.keyTakeaways.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </section>
          )}

          <div className="mt-8">
            <RichContent doc={post.content} headings={headings} variant={coding ? 'notes' : undefined} />
          </div>

          {coding && (prev || next) && (
            <nav aria-label="Previous and next note" className="mt-12 grid gap-3 sm:grid-cols-2">
              {prev ? (
                <Link href={`/blog/${prev.slug}`} className="rounded-xl border border-line bg-surface p-4 transition-colors hover:border-accent/60 hover:bg-surface-2">
                  <span className="text-xs text-muted">← Previous{prev.folder ? ` · ${prev.folder}` : ''}</span>
                  <span className="mt-1 block font-semibold leading-snug">{prev.title}</span>
                </Link>
              ) : <span />}
              {next && (
                <Link href={`/blog/${next.slug}`} className="rounded-xl border border-line bg-surface p-4 text-right transition-colors hover:border-accent/60 hover:bg-surface-2">
                  <span className="text-xs text-muted">Next{next.folder ? ` · ${next.folder}` : ''} →</span>
                  <span className="mt-1 block font-semibold leading-snug">{next.title}</span>
                </Link>
              )}
            </nav>
          )}

          {resources.length > 0 && (
            <section aria-labelledby="resources-heading" className="mt-10 rounded-xl border border-line bg-surface p-5">
              <h2 id="resources-heading" className="text-lg font-semibold">Practical resources</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {resources.map((r) => (
                  <li key={r.url} className="flex flex-wrap items-baseline gap-2">
                    <span className="rounded bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">{RESOURCE_LABEL[r.type] ?? 'Link'}</span>
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="font-medium text-accent underline underline-offset-4">{r.label}</a>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {practice.length > 0 && (
            <section aria-labelledby="practice-heading" className="mt-10 rounded-xl border border-line bg-surface p-5">
              <h2 id="practice-heading" className="text-lg font-semibold">Practice what you learned</h2>
              <p className="mt-1 text-sm text-muted">Try these interview questions on the same topic and get AI feedback on your answers.</p>
              <ul className="mt-4 space-y-2">
                {practice.map((p) => (
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
          )}

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
        </article>

        {/* On wide screens this column stays in view while reading and scrolls on its own when it is taller than the window */}
        <aside className="xl:sticky xl:top-20 xl:max-h-[calc(100dvh-6rem)] xl:self-start xl:overflow-y-auto xl:overscroll-contain xl:pr-1" aria-label="Article information">
          <PostSidebar post={post} url={url} related={related} helpfulCounts={helpfulCounts} />
        </aside>
      </div>
      </div>
    </div>
  );
}
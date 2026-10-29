import Link from 'next/link';
import { buildHeadingIndex } from '@/lib/blog-content';
import { CATEGORY_BY_SLUG, RESOURCE_LABEL } from '@/lib/blog-constants';
import { DIFFICULTY_LABEL } from '@/lib/constants';
import { absoluteUrl } from '@/lib/seo';
import Breadcrumbs from './Breadcrumbs';
import RichContent from './RichContent';
import ReadingProgress from './ReadingProgress';
import PostSidebar from './PostSidebar';
import Engagement from './Engagement';
import Comments from './Comments';
import ViewTracker from './ViewTracker';

const DIFF_BADGE = { EASY: 'bg-easy/12 text-easy', MEDIUM: 'bg-medium/12 text-medium', HARD: 'bg-hard/12 text-hard' };

/**
 * The whole article page body. Used by the public route and by the admin preview, so what an editor previews is
 * exactly what readers get. `preview` hides anything that writes data (views, likes, comments).
 */
export default function ArticleView({ post, related = [], practice = [], viewer = {}, helpfulCounts = { yes: 0, no: 0 }, comments = [], preview = false }) {
  const category = CATEGORY_BY_SLUG[post.category];
  const coding = post.kind === 'CODING';
  const headings = buildHeadingIndex(post.content);
  const url = absoluteUrl(`/blog/${post.slug}`);
  const loginHref = `/login?redirect_url=${encodeURIComponent(`/blog/${post.slug}`)}`;
  const resources = Array.isArray(post.resources) ? post.resources : [];

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

      <div className={`mx-auto w-full ${coding ? 'max-w-[78rem]' : 'max-w-[72rem]'}`}>
      <header className="max-w-[48rem]">
        <Breadcrumbs items={crumbs} />
        {category && (
          <p className="mt-6 text-xs font-semibold uppercase tracking-widest text-accent">
            {category.group} / {category.name}
            {coding && <span className="ml-2 rounded-full bg-accent-soft px-2 py-0.5 font-mono normal-case tracking-normal">{'</>'} Coding notes</span>}
          </p>
        )}
        <h1 className="mt-2 max-w-[48rem] text-3xl font-bold leading-tight tracking-tight sm:text-4xl">{post.title}</h1>
        {post.excerpt && <p className="mt-3 max-w-[48rem] text-lg leading-relaxed text-muted">{post.excerpt}</p>}
      </header>

      <div className={`mt-8 grid gap-8 ${coding ? 'xl:grid-cols-[minmax(0,54rem)_20rem]' : 'xl:grid-cols-[minmax(0,48rem)_20rem]'}`}>
        <article className="min-w-0" id="article-body">
          {post.keyTakeaways?.length > 0 && (
            <section aria-labelledby="takeaways-heading" className="mt-8 rounded-xl border border-line bg-accent-soft/50 p-5">
              <h2 id="takeaways-heading" className="text-sm font-semibold uppercase tracking-wider text-accent">Key takeaways</h2>
              <ul className="mt-3 list-disc space-y-1.5 pl-5 text-[0.95rem] leading-relaxed">
                {post.keyTakeaways.map((t) => <li key={t}>{t}</li>)}
              </ul>
            </section>
          )}

          <div className="mt-8">
            <RichContent doc={post.content} headings={headings} />
          </div>

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
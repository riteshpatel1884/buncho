import Link from 'next/link';
import PostCard from './PostCard';
import { Search } from '@/components/icons';

function hrefFor(base, params) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v && v !== 1 && sp.set(k, String(v)));
  const qs = sp.toString();
  return qs ? `${base}?${qs}` : base;
}

/** Shared by /blog and /blog/category/[category]. All filtering is plain links and a GET form: no client JS. */
export default function BlogIndex({ heading, intro, basePath, result, filters, featured = [] }) {
  const { q, tag } = filters;
  const filtered = Boolean(q || tag);
  const showFeatured = !filtered && result.page === 1 && featured.length > 0;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6">
      <header>
        <p className="text-xs font-semibold uppercase tracking-widest text-accent">Buncho blog</p>
        <h1 className="mt-1 text-3xl font-semibold tracking-tight sm:text-4xl">{heading}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">{intro}</p>
      </header>

      <form action={basePath} role="search" className="mt-6 flex max-w-xl gap-2">
        <div className="relative flex-1">
          <label htmlFor="blog-search" className="sr-only">Search articles</label>
          <Search width={16} height={16} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
          <input
            id="blog-search"
            name="q"
            type="search"
            defaultValue={q}
            maxLength={80}
            placeholder="Search by title or keyword"
            className="h-10 w-full rounded-full bg-surface-2 pl-9 pr-3 text-sm outline-none placeholder:text-muted"
          />
        </div>
        <button type="submit" className="rounded-full bg-accent px-5 text-sm font-semibold text-accent-ink hover:opacity-90">Search</button>
      </form>

      {filtered && (
        <p className="mt-6 text-sm text-muted" role="status">
          {result.total} article{result.total === 1 ? '' : 's'}
          {q && <> matching “{q}”</>}{tag && <> tagged #{tag}</>}.{' '}
          <Link href={basePath} className="font-semibold text-accent underline underline-offset-4">Clear filters</Link>
        </p>
      )}

      {showFeatured && (
        <section aria-labelledby="featured-heading" className="mt-10">
          <h2 id="featured-heading" className="text-lg font-semibold">Featured</h2>
          <div className="mt-4 space-y-5">
            <PostCard post={featured[0]} large priority />
            {featured.slice(1).map((p) => <PostCard key={p.id} post={p} large />)}
          </div>
        </section>
      )}

      <section aria-labelledby="latest-heading" className="mt-10">
        <h2 id="latest-heading" className="text-lg font-semibold">{filtered ? 'Results' : 'Latest articles'}</h2>
        {result.items.length ? (
          <div className="mt-4 space-y-5">
            {result.items.map((p, i) => <PostCard key={p.id} post={p} large priority={!showFeatured && i < 2} />)}
          </div>
        ) : (
          <p className="mt-4 rounded-lg border border-dashed border-line p-8 text-center text-sm text-muted">
            {filtered ? 'No articles match that search yet.' : 'New articles are on the way.'}
          </p>
        )}
      </section>

      {result.pages > 1 && (
        <nav aria-label="Pagination" className="mt-10 flex items-center justify-between text-sm">
          {result.page > 1 ? (
            <Link rel="prev" href={hrefFor(basePath, { q, tag, page: result.page - 1 })} className="rounded-md border border-line bg-surface px-4 py-2 font-medium hover:bg-surface-2">Previous</Link>
          ) : <span />}
          <span className="text-muted">Page {result.page} of {result.pages}</span>
          {result.page < result.pages ? (
            <Link rel="next" href={hrefFor(basePath, { q, tag, page: result.page + 1 })} className="rounded-md border border-line bg-surface px-4 py-2 font-medium hover:bg-surface-2">Next</Link>
          ) : <span />}
        </nav>
      )}
    </div>
  );
}
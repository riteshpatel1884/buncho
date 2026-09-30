import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";
import { timeAgo } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import ProductLogo from "@/components/ProductLogo";
import CategoryFilter from "@/components/CategoryFilter";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }) {
  const { q, category, sort = "week" } = await searchParams;
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [all, categories, user, weekly, voteCount, clickCount] = await Promise.all([
    prisma.product.findMany({
      where: { status: "APPROVED" },
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { category: true, _count: { select: { votes: true, comments: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getDbUser(),
    prisma.vote.groupBy({ by: ["productId"], where: { createdAt: { gte: weekAgo } }, _count: { _all: true } }),
    prisma.vote.count(),
    prisma.productEvent.count({ where: { type: "CLICK" } }),
  ]);

  const weeklyMap = new Map(weekly.map((w) => [w.productId, w._count._all]));
  const wv = (p) => weeklyMap.get(p.id) ?? 0;

  const byWeek = [...all].sort((a, b) => wv(b) - wv(a) || b._count.votes - a._count.votes);
  const podium = byWeek.slice(0, 3);
  const fresh = all.slice(0, 5);

  let list = all.filter((p) => {
    if (category && p.category.slug !== category) return false;
    if (q) {
      const s = q.toLowerCase();
      if (!p.name.toLowerCase().includes(s) && !p.tagline.toLowerCase().includes(s)) return false;
    }
    return true;
  });
  if (sort === "all") list = list.sort((a, b) => b._count.votes - a._count.votes);
  else if (sort === "week") list = list.sort((a, b) => wv(b) - wv(a) || b._count.votes - a._count.votes);

  const votedIds = new Set();
  if (user && list.length) {
    const votes = await prisma.vote.findMany({
      where: { userId: user.id, productId: { in: list.map((p) => p.id) } },
      select: { productId: true },
    });
    votes.forEach((v) => votedIds.add(v.productId));
  }

  const tabHref = (s) => {
    const p = new URLSearchParams({ sort: s });
    if (category) p.set("category", category);
    if (q) p.set("q", q);
    return `/?${p.toString()}`;
  };
  const tabs = [["week", "This week"], ["all", "All time"], ["new", "Newest"]];
  const medal = ["bg-gold text-on-brand", "bg-[#d5dbea] text-on-brand", "bg-[#f0b58a] text-on-brand"];

  return (
    <div className="space-y-12">
      {/* Hero */}
      <section
        className="grid gap-10 rounded-3xl bg-navy p-8 text-white sm:p-12 lg:grid-cols-[1.2fr_1fr] lg:items-center"
        style={{ backgroundImage: "radial-gradient(circle at 88% 8%, rgba(52,214,123,0.22), transparent 42%)" }}
      >
        <div>
          <h1 className="font-display text-4xl font-bold leading-[1.05] sm:text-5xl">
            Discover what India is building.
          </h1>
          <p className="mt-4 max-w-md text-lg text-on-navy">
            Upvote the tools you like, talk to the founders behind them, and launch your own.
          </p>
          <form data-nav className="mt-7 flex max-w-md gap-2">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search products"
              aria-label="Search products"
              className="w-full rounded-full bg-surface px-5 py-3 text-sm text-ink placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-white/60"
            />
            <button className="btn-primary shrink-0">Search</button>
          </form>
          <p className="mt-6 text-sm text-on-navy">
            {all.length} products, {voteCount} upvotes and {clickCount} visits sent to founders so far.
          </p>
        </div>

        <div className="rounded-2xl bg-surface p-5 text-ink shadow-xl">
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="font-display text-lg font-bold">Top this week</h2>
            <span className="text-xs text-muted">Rolling 7 days</span>
          </div>
          {podium.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">No launches yet. Yours could be first.</p>
          ) : (
            <ol className="space-y-1">
              {podium.map((p, i) => (
                <li key={p.id}>
                  <Link href={`/products/${p.slug}`} className="flex items-center gap-3 rounded-xl p-2 hover:bg-surface-2">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${medal[i]}`}>{i + 1}</span>
                    <ProductLogo product={p} size={40} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{p.name}</span>
                      <span className="block truncate text-xs text-muted">{p.tagline}</span>
                    </span>
                    <span className="text-sm font-semibold text-brand">{wv(p)}</span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </div>
      </section>

      {/* Browse */}
      <section className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <CategoryFilter categories={categories} active={category} sort={sort} q={q} />

          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-2xl font-bold">
              {q ? `Results for "${q}"` : "Products"}
            </h2>
            <div className="flex rounded-full border border-line bg-surface p-1 text-sm font-medium">
              {tabs.map(([s, label]) => (
                <Link
                  key={s}
                  href={tabHref(s)}
                  className={`rounded-full px-3.5 py-1 ${sort === s ? "bg-brand text-on-brand" : "text-muted hover:text-ink"}`}
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          {list.length === 0 ? (
            <div className="card border-dashed p-10 text-center">
              <p className="font-display text-lg font-semibold">Nothing here yet</p>
              <p className="mt-1 text-sm text-muted">Try another category, or be the first to launch in this one.</p>
              <Link href="/submit" className="btn-primary mt-5">Launch a product</Link>
            </div>
          ) : (
            <ul className="space-y-3">
              {list.map((p, i) => (
                <ProductCard key={p.id} product={p} rank={sort === "new" ? undefined : i + 1} voted={votedIds.has(p.id)} />
              ))}
            </ul>
          )}
        </div>

        <aside className="space-y-5">
          <div className="rounded-2xl bg-brand-soft p-6">
            <h3 className="font-display text-xl font-bold">Built something?</h3>
            <p className="mt-2 text-sm text-muted">
              Get in front of people who enjoy finding new products. Launching is free and reviewed by hand.
            </p>
            <Link href="/submit" className="btn-primary mt-4">Launch your product</Link>
          </div>

          <div className="card p-5">
            <h3 className="font-display text-lg font-bold">Fresh launches</h3>
            {fresh.length === 0 ? (
              <p className="mt-2 text-sm text-muted">New products will show up here.</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {fresh.map((p) => (
                  <li key={p.id}>
                    <Link href={`/products/${p.slug}`} className="flex items-center gap-3">
                      <ProductLogo product={p} size={36} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-semibold">{p.name}</span>
                        <span className="block text-xs text-muted">{p.category.name}, {timeAgo(p.createdAt)}</span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </section>

      {/* How it works */}
      <section className="card p-8 sm:p-10">
        <h2 className="font-display text-2xl font-bold">How launching works</h2>
        <ol className="mt-6 grid gap-6 sm:grid-cols-3">
          {[
            ["Submit", "Add your product with a tagline, link and category. It takes about five minutes."],
            ["We review", "Every submission is checked by a person so the feed stays useful, not spammy."],
            ["Collect upvotes", "Go live, climb the weekly ranking, and see views and clicks on your dashboard."],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mint-soft font-display font-bold text-mint">{i + 1}</span>
              <div>
                <p className="font-semibold">{t}</p>
                <p className="mt-1 text-sm text-muted">{d}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
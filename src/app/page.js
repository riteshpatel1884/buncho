import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";
import { timeAgo } from "@/lib/utils";
import ProductCard from "@/components/ProductCard";
import ProductLogo from "@/components/ProductLogo";
import CountUp from "@/components/CountUp";
import RotatingWord from "@/components/RotatingWord";
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
  const recent = all.slice(0, 10);
  const tickerItems = recent.length === 0 ? [] : Array.from({ length: Math.max(1, Math.ceil(8 / recent.length)) }).flatMap(() => recent);
  const medal = ["bg-gold text-on-brand", "bg-[#d5dbea] text-on-brand", "bg-[#f0b58a] text-on-brand"];

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* Hero */}
      <section
        className="glow relative grid grid-cols-1 gap-10 overflow-hidden rounded-3xl bg-navy p-6 text-white sm:p-10 lg:p-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:items-center"
        style={{ backgroundImage: "radial-gradient(circle at 88% 8%, rgba(52,214,123,0.22), transparent 42%)" }}
      >
        <div aria-hidden="true" className="dots pointer-events-none absolute inset-0" />
        <div aria-hidden="true" className="spot" />
        <div aria-hidden="true" className="blob pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-brand/20 blur-3xl" />
        <div aria-hidden="true" className="blob pointer-events-none absolute -bottom-32 right-10 h-80 w-80 rounded-full bg-brand/15 blur-3xl" style={{ animationDelay: "-6s" }} />
        <div className="rise relative">
          <h1 className="font-display text-4xl font-bold leading-[1.05] sm:text-5xl">
            Discover what India is<br />
            <RotatingWord words={["building", "launching", "shipping"]} />
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
          <div className="mt-5 flex flex-wrap items-center gap-4">
            <Link href="/submit" className="btn-primary btn-ring">Launch your product</Link>
            <span className="text-sm text-on-navy">Free to list, reviewed by hand</span>
          </div>
          <p className="mt-6 text-sm text-on-navy">
            <CountUp value={all.length} /> products, <CountUp value={voteCount} /> upvotes and{" "}
            <CountUp value={clickCount} /> visits sent to founders so far.
          </p>
        </div>

        <div className="rise relative rounded-2xl bg-surface p-5 text-ink shadow-xl" style={{ "--i": 2 }}>
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="flex items-center gap-2 font-display text-lg font-bold">
              <span className="relative flex h-2.5 w-2.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-70" />
                <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand" />
              </span>
              Top this week
            </h2>
            <span className="text-xs text-muted">Rolling 7 days</span>
          </div>
          {podium.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted">No launches yet. Yours could be first.</p>
          ) : (
            <ol className="space-y-1">
              {podium.map((p, i) => (
                <li key={p.id} className="rise" style={{ "--i": i + 3 }}>
                  <Link href={`/products/${p.slug}`} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-surface-2">
                    <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${medal[i]} ${i === 0 ? "medal-glow" : ""}`}>{i + 1}</span>
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


      {/* Just launched ticker */}
      {tickerItems.length > 0 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
          <span className="flex shrink-0 items-center gap-2 text-sm font-semibold">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand opacity-70" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-brand" />
            </span>
            Just launched
          </span>
          <div className="fade-edges min-w-0 flex-1 overflow-hidden">
            <div className="marquee flex w-max">
              {[...tickerItems, ...tickerItems].map((p, i) => (
                <Link
                  key={`${p.id}-${i}`}
                  href={`/products/${p.slug}`}
                  className="mr-3 flex shrink-0 items-center gap-2 rounded-full border border-line bg-surface-2 px-3 py-1.5 text-sm font-medium transition-colors hover:border-brand"
                >
                  <ProductLogo product={p} size={24} />
                  {p.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Browse */}
      <section className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-5">
          <CategoryFilter categories={categories} active={category} sort={sort} q={q} />

          <div className="flex flex-wrap items-center justify-between gap-3">
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
                <ProductCard key={p.id} product={p} rank={sort === "new" ? undefined : i + 1} voted={votedIds.has(p.id)} index={i} />
              ))}
            </ul>
          )}
        </div>

        <aside className="rise grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-1" style={{ "--i": 3 }}>
          <div className="rounded-2xl bg-brand-soft p-6">
            <h3 className="font-display text-xl font-bold">Built something?</h3>
            <p className="mt-2 text-sm text-muted">
              Get in front of people who enjoy finding new products. Launching is free and reviewed by hand.
            </p>
            <Link href="/submit" className="btn-primary btn-ring mt-4">Launch your product</Link>
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
      <section className="card reveal p-6 sm:p-10">
        <h2 className="font-display text-2xl font-bold">How launching works</h2>
        <ol className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
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
      {/* Why launch */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          ["Reach people who browse for new tools", "Visitors explore by category and weekly ranking, so your listing meets people who like trying things.",
            <><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z" /><circle cx="12" cy="12" r="3" /></>],
          ["See what is working", "Views, clicks and click rate for every product, right on your dashboard.",
            <path d="M4 20V10M10 20V4M16 20v-8M22 20H2" />],
          ["Earn a badge worth sharing", "Climb into the weekly top three and show your audience the proof.",
            <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9L12 3z" />],
        ].map(([title, text, icon]) => (
          <div key={title} className="card card-hover glow p-6">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-mint-soft text-mint">
              <svg className="draw h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{icon}</svg>
            </span>
            <h3 className="mt-4 font-display text-lg font-bold">{title}</h3>
            <p className="mt-1 text-sm text-muted">{text}</p>
          </div>
        ))}
      </section>

      {/* Founder call to action */}
      <section className="aurora reveal relative grid grid-cols-1 items-center gap-8 overflow-hidden rounded-3xl border border-line bg-surface p-6 sm:p-10 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:p-12">
        <div>
          <h2 className="font-display text-3xl font-bold leading-tight sm:text-4xl">Built something? Let people find it.</h2>
          <p className="mt-3 max-w-md text-muted">
            Launching is free, reviewed by hand, and usually live within a day. Add your product in about five minutes.
          </p>
          <Link href="/submit" className="btn-primary btn-ring mt-6">Launch your product</Link>
        </div>
        <div aria-hidden="true" className="relative mx-auto hidden h-52 w-full max-w-sm lg:block">
          {[
            ["left-0 top-0", "-4deg", 0],
            ["left-10 top-16", "2deg", 1],
            ["left-4 top-32", "-2deg", 2],
          ].map(([pos, r, n]) => (
            <div key={n} className={`bob card absolute ${pos} flex w-72 items-center gap-3 p-3 shadow-xl`} style={{ "--r": r, "--i": n }}>
              <span className="h-10 w-10 shrink-0 rounded-lg bg-mint-soft" />
              <span className="flex-1 space-y-2">
                <span className="block h-2.5 w-28 rounded-full bg-line" />
                <span className="block h-2 w-40 rounded-full bg-surface-2" />
              </span>
              <span className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand text-xs text-brand">▲</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
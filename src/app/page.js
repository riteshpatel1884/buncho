import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDbUser } from "@/lib/user";
import ProductCard from "@/components/ProductCard";
import CategoryFilter from "@/components/CategoryFilter";

export const dynamic = "force-dynamic";

export default async function Home({ searchParams }) {
  const { q, category, sort = "trending" } = await searchParams;

  const where = { status: "APPROVED" };
  if (category) where.category = { slug: category };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { tagline: { contains: q, mode: "insensitive" } },
    ];
  }

  const orderBy =
    sort === "new" ? { createdAt: "desc" } : [{ votes: { _count: "desc" } }, { createdAt: "desc" }];

  const [products, categories, user] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy,
      take: 50,
      include: { category: true, _count: { select: { votes: true } } },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    getDbUser(),
  ]);

  const votedIds = new Set();
  if (user && products.length) {
    const votes = await prisma.vote.findMany({
      where: { userId: user.id, productId: { in: products.map((p) => p.id) } },
      select: { productId: true },
    });
    votes.forEach((v) => votedIds.add(v.productId));
  }

  const tab = (s, label) => (
    <Link
      href={`/?sort=${s}${category ? `&category=${category}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
      className={sort === s ? "font-semibold underline underline-offset-4" : "text-muted"}
    >
      {label}
    </Link>
  );

  return (
    <div className="space-y-6">
      <section>
        <h1 className="font-display text-4xl font-bold">Products built by Indian founders</h1>
        <p className="mt-2 max-w-xl text-muted">Find tools made in India, upvote the ones you like, and launch your own.</p>
        <form className="mt-4 flex max-w-md gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="Search products"
            className="flex-1 rounded-md border border-line bg-white px-3 py-2"
          />
          <button className="rounded-md bg-ink px-4 py-2 text-white">Search</button>
        </form>
      </section>

      <CategoryFilter categories={categories} active={category} sort={sort} q={q} />

      <div className="flex gap-4 text-sm">
        {tab("trending", "Most upvoted")}
        {tab("new", "Newest")}
      </div>

      {products.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-8 text-center text-muted">
          Nothing here yet. <Link href="/submit" className="font-medium text-accent">Launch the first product.</Link>
        </p>
      ) : (
        <ul className="space-y-3">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} voted={votedIds.has(p.id)} />
          ))}
        </ul>
      )}
    </div>
  );
}

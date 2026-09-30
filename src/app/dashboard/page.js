import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import ProductLogo from "@/components/ProductLogo";
import StatusBadge from "@/components/StatusBadge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard | buncho" };

export default async function Dashboard({ searchParams }) {
  const { submitted } = await searchParams;
  const user = await getOrCreateUser();
  const products = await prisma.product.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { votes: true } } },
  });

  const events = await prisma.productEvent.groupBy({
    by: ["productId", "type"],
    where: { productId: { in: products.map((p) => p.id) } },
    _count: { _all: true },
  });
  const stat = (id, type) => events.find((e) => e.productId === id && e.type === type)?._count._all ?? 0;

  const totals = products.reduce(
    (t, p) => ({
      views: t.views + stat(p.id, "VIEW"),
      clicks: t.clicks + stat(p.id, "CLICK"),
      votes: t.votes + p._count.votes,
    }),
    { views: 0, clicks: 0, votes: 0 }
  );

  const cards = [
    ["Products", products.length],
    ["Views", totals.views],
    ["Clicks to your site", totals.clicks],
    ["Upvotes", totals.votes],
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-bold">Your dashboard</h1>
          <p className="mt-1 text-muted">See how your launches are doing.</p>
        </div>
        <Link href="/submit" className="btn-primary">Launch another product</Link>
      </div>

      {submitted && (
        <p role="status" className="rounded-xl bg-peacock-soft p-4 text-sm font-medium text-peacock-dark">
          Submitted. Your product is in review and will appear publicly once approved.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="card p-5">
            <p className="font-display text-3xl font-bold">{value}</p>
            <p className="mt-1 text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="card border-dashed p-10 text-center">
          <p className="font-display text-lg font-semibold">You haven't launched anything yet</p>
          <p className="mt-1 text-sm text-muted">Your first product takes about five minutes to submit.</p>
          <Link href="/submit" className="btn-primary mt-5">Launch a product</Link>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="p-4 font-medium">Product</th>
                <th className="font-medium">Status</th>
                <th className="font-medium">Views</th>
                <th className="font-medium">Clicks</th>
                <th className="font-medium">Click rate</th>
                <th className="pr-4 font-medium">Votes</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const v = stat(p.id, "VIEW");
                const c = stat(p.id, "CLICK");
                return (
                  <tr key={p.id} className="border-b border-line last:border-0">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <ProductLogo product={p} size={36} />
                        {p.status === "APPROVED" ? (
                          <Link href={`/products/${p.slug}`} className="font-semibold hover:underline">{p.name}</Link>
                        ) : (
                          <span className="font-semibold">{p.name}</span>
                        )}
                      </div>
                    </td>
                    <td><StatusBadge status={p.status} /></td>
                    <td>{v}</td>
                    <td>{c}</td>
                    <td>{v ? `${Math.round((c / v) * 100)}%` : "0%"}</td>
                    <td className="pr-4">{p._count.votes}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

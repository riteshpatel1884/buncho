import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import ProductLogo from "@/components/ProductLogo";
import CountUp from "@/components/CountUp";
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
  const rate = (v, c) => (v ? `${Math.round((c / v) * 100)}%` : "0%");

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Your dashboard</h1>
          <p className="mt-1 text-muted">See how your launches are doing.</p>
        </div>
        <Link href="/submit" className="btn-primary">Launch another product</Link>
      </div>

      {submitted && (
        <p role="status" className="rounded-xl bg-mint-soft p-4 text-sm font-medium text-mint">
          Submitted. Your product is in review and will appear publicly once approved.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {cards.map(([label, value], i) => (
          <div key={label} className="card rise p-4 sm:p-5" style={{ "--i": i }}>
            <p className="font-display text-2xl font-bold sm:text-3xl"><CountUp value={value} /></p>
            <p className="mt-1 text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="card border-dashed p-8 text-center sm:p-10">
          <p className="font-display text-lg font-semibold">You haven't launched anything yet</p>
          <p className="mt-1 text-sm text-muted">Your first product takes about five minutes to submit.</p>
          <Link href="/submit" className="btn-primary mt-5">Launch a product</Link>
        </div>
      ) : (
        <>
          {/* Phones and small tablets: one card per product */}
          <ul className="space-y-3 md:hidden">
            {products.map((p) => {
              const v = stat(p.id, "VIEW");
              const c = stat(p.id, "CLICK");
              return (
                <li key={p.id} className="card p-4">
                  <div className="flex items-center gap-3">
                    <ProductLogo product={p} size={40} />
                    <div className="min-w-0 flex-1">
                      {p.status === "APPROVED" ? (
                        <Link href={`/products/${p.slug}`} className="block truncate font-semibold">{p.name}</Link>
                      ) : (
                        <span className="block truncate font-semibold">{p.name}</span>
                      )}
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                  <dl className="mt-4 grid grid-cols-4 gap-2 text-center">
                    {[["Views", v], ["Clicks", c], ["Rate", rate(v, c)], ["Votes", p._count.votes]].map(([k, val]) => (
                      <div key={k}>
                        <dd className="font-display text-lg font-bold">{val}</dd>
                        <dt className="text-xs text-muted">{k}</dt>
                      </div>
                    ))}
                  </dl>
                </li>
              );
            })}
          </ul>

          {/* Tablets and up: table */}
          <div className="card rise hidden overflow-x-auto md:block" style={{ "--i": 4 }}>
            <table className="w-full text-left text-sm">
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
                      <td>{rate(v, c)}</td>
                      <td className="pr-4">{p._count.votes}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
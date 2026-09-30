import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";

export const dynamic = "force-dynamic";

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

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-bold">My products</h1>
      {submitted && (
        <p className="rounded-md bg-green-50 p-3 text-sm text-green-800">
          Submitted. It will appear publicly once approved.
        </p>
      )}
      {products.length === 0 ? (
        <p className="text-muted">
          You haven't launched anything yet. <Link href="/submit" className="font-medium text-accent">Launch a product.</Link>
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-line bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr><th className="p-3">Product</th><th>Status</th><th>Views</th><th>Clicks</th><th>Votes</th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="p-3 font-medium">
                    {p.status === "APPROVED" ? <Link href={`/products/${p.slug}`}>{p.name}</Link> : p.name}
                  </td>
                  <td>{p.status.toLowerCase()}</td>
                  <td>{stat(p.id, "VIEW")}</td>
                  <td>{stat(p.id, "CLICK")}</td>
                  <td>{p._count.votes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

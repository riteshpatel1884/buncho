import Link from "next/link";
import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/user";
import { timeAgo } from "@/lib/utils";
import ProductLogo from "@/components/ProductLogo";
import SubmitButton from "@/components/SubmitButton";

export const dynamic = "force-dynamic";
export const metadata = { title: "Moderation | buncho" };

async function setStatus(formData) {
  "use server";
  if (!(await isAdmin())) return;
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["APPROVED", "REJECTED", "PENDING"].includes(status)) return;
  await prisma.product.update({ where: { id }, data: { status } });
  revalidatePath("/admin");
  revalidatePath("/");
}

const TABS = [
  ["PENDING", "In review"],
  ["APPROVED", "Live"],
  ["REJECTED", "Not approved"],
];

export default async function Admin({ searchParams }) {
  if (!(await isAdmin())) notFound();
  const { status: raw } = await searchParams;
  const status = TABS.some(([s]) => s === raw) ? raw : "PENDING";

  const [products, grouped] = await Promise.all([
    prisma.product.findMany({
      where: { status },
      orderBy: { createdAt: status === "PENDING" ? "asc" : "desc" },
      include: { user: { select: { email: true } }, category: true },
    }),
    prisma.product.groupBy({ by: ["status"], _count: { _all: true } }),
  ]);
  const count = (s) => grouped.find((g) => g.status === s)?._count._all ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-4xl font-bold">Moderation</h1>
        <p className="mt-1 text-muted">Review submissions and manage what is live.</p>
      </div>

      <div className="flex w-fit rounded-full border border-line bg-surface p-1 text-sm font-medium">
        {TABS.map(([s, label]) => (
          <Link
            key={s}
            href={`/admin?status=${s}`}
            className={`rounded-full px-4 py-1.5 ${status === s ? "bg-brand text-on-brand" : "text-muted hover:text-ink"}`}
          >
            {label} ({count(s)})
          </Link>
        ))}
      </div>

      {products.length === 0 ? (
        <div className="card border-dashed p-10 text-center text-muted">Nothing in this list.</div>
      ) : (
        <ul className="space-y-4">
          {products.map((p, i) => (
            <li key={p.id} className="card rise p-5 sm:p-6" style={{ "--i": Math.min(i, 8) }}>
              <div className="flex flex-col gap-4 sm:flex-row">
                <ProductLogo product={p} size={56} />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline gap-x-3">
                    <h2 className="font-display text-xl font-bold">{p.name}</h2>
                    <span className="text-xs text-muted">submitted {timeAgo(p.createdAt)}</span>
                  </div>
                  <p className="text-sm text-muted">{p.tagline}</p>
                  <p className="mt-3 whitespace-pre-line text-sm">{p.description}</p>
                  <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded-full bg-mint-soft px-2.5 py-0.5 font-medium text-mint">{p.category.name}</span>
                    {p.pricing && <span className="rounded-full border border-line px-2.5 py-0.5 text-muted">{p.pricing}</span>}
                    <span className="text-muted">by {p.user.email}</span>
                  </div>
                  <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block break-all text-sm font-medium text-brand hover:underline">
                    {p.websiteUrl}
                  </a>
                </div>
              </div>

              <form action={setStatus} className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                <input type="hidden" name="id" value={p.id} />
                {status !== "APPROVED" && (
                  <SubmitButton name="status" value="APPROVED" className="btn-primary" pendingText="Approving">Approve</SubmitButton>
                )}
                {status !== "REJECTED" && (
                  <SubmitButton name="status" value="REJECTED" className="btn-outline" pendingText="Saving">
                    {status === "APPROVED" ? "Unpublish" : "Reject"}
                  </SubmitButton>
                )}
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/user";
import ProductLogo from "@/components/ProductLogo";
import SubmitButton from "@/components/SubmitButton";
import PartnerForm from "./PartnerForm";
import { togglePartner, deletePartner } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Partners | buncho" };

export default async function AdminPartners() {
  if (!(await isAdmin())) notFound();

  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [partners, total, recent] = await Promise.all([
    prisma.partner.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] }),
    prisma.partnerClick.groupBy({ by: ["partnerId"], _count: { _all: true } }),
    prisma.partnerClick.groupBy({ by: ["partnerId"], where: { createdAt: { gte: since } }, _count: { _all: true } }),
  ]);
  const count = (rows, id) => rows.find((r) => r.partnerId === id)?._count._all ?? 0;
  // YYYY-MM-DD in India time, the format date inputs expect
  const istDate = (d) => d.toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Partners</h1>
          <p className="mt-1 text-muted">Sponsored and affiliate tools shown to founders. They never affect product ranking.</p>
        </div>
        <Link href="/admin" className="btn-outline">Back to moderation</Link>
      </div>

      <PartnerForm />

      {partners.length === 0 ? (
        <div className="card border-dashed p-8 text-center text-muted">No partners yet.</div>
      ) : (
        <ul className="space-y-3">
          {partners.map((p) => (
            <li key={p.id} className="card p-4">
              <div className="flex flex-wrap items-center gap-4">
                <ProductLogo product={p} size={44} />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{p.name}</p>
                  <p className="text-xs text-muted">
                    {p.category}, {p.kind === "SPONSOR" ? "Sponsored" : "Affiliate"}, order {p.sortOrder}
                    {p.endsAt ? `, ends ${p.endsAt.toLocaleDateString("en-IN")}` : ""}
                  </p>
                </div>
                <div className="text-center text-sm">
                  <p className="font-display text-lg font-bold">{count(recent, p.id)}</p>
                  <p className="text-xs text-muted">clicks, 30 days ({count(total, p.id)} total)</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.active ? "bg-mint-soft text-mint" : "bg-surface-2 text-muted"}`}>
                  {p.active ? "Live" : "Paused"}
                </span>
                <form action={togglePartner}>
                  <input type="hidden" name="id" value={p.id} />
                  <SubmitButton className="btn-outline !px-4 !py-2" pendingText="Saving">{p.active ? "Pause" : "Resume"}</SubmitButton>
                </form>
                <form action={deletePartner}>
                  <input type="hidden" name="id" value={p.id} />
                  <SubmitButton className="btn-outline !px-4 !py-2" pendingText="Deleting">Delete</SubmitButton>
                </form>
              </div>

              <details className="mt-4 border-t border-line pt-4">
                <summary className="cursor-pointer text-sm font-medium text-brand">Edit {p.name}</summary>
                <div className="mt-4">
                  <PartnerForm
                    partner={{
                      id: p.id,
                      name: p.name,
                      category: p.category,
                      tagline: p.tagline,
                      offer: p.offer,
                      linkUrl: p.linkUrl,
                      logoUrl: p.logoUrl,
                      kind: p.kind,
                      sortOrder: p.sortOrder,
                      startsAt: p.startsAt ? istDate(p.startsAt) : "",
                      endsAt: p.endsAt ? istDate(p.endsAt) : "",
                    }}
                  />
                </div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
import Link from "next/link";
import { getActivePartners, PARTNER_CATEGORIES } from "@/lib/partners";
import PartnerCard, { PARTNER_NOTE } from "@/components/PartnerCard";

export const dynamic = "force-dynamic";
export const metadata = { title: "Tools for founders | buncho" };

export default async function PartnersPage() {
  const partners = await getActivePartners();
  const groups = [...new Set([...PARTNER_CATEGORIES, ...partners.map((p) => p.category)])]
    .map((c) => [c, partners.filter((p) => p.category === c)])
    .filter(([, list]) => list.length > 0);
  const email = process.env.NEXT_PUBLIC_CONTACT_EMAIL;

  return (
    <div className="space-y-10">
      <div className="max-w-2xl space-y-3">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Tools for founders</h1>
        <p className="text-lg text-muted">Hosting, email, analytics and more. Picked for people building and launching products in India.</p>
        <p className="rounded-xl bg-surface-2 p-4 text-sm text-muted">{PARTNER_NOTE}</p>
      </div>

      {groups.length === 0 ? (
        <div className="card border-dashed p-10 text-center text-muted">Partner offers are coming soon.</div>
      ) : (
        groups.map(([category, list]) => (
          <section key={category} className="space-y-4">
            <h2 className="font-display text-xl font-bold">
              {category}
            </h2>
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {list.map((p) => <PartnerCard key={p.id} partner={p} />)}
            </ul>
          </section>
        ))
      )}

      <section className="card p-6 sm:p-8">
        <h2 className="font-display text-2xl font-bold">Sell to Indian founders?</h2>
        <p className="mt-2 max-w-2xl text-muted">
          Sponsor a section of Buncho and reach people who are building and launching right now. Sponsors get a clearly labelled
          placement and click reports. They can't buy ranking, Daily Pick turns or a better Buncho Score, ever.
        </p>
        {email ? (
          <a href={`mailto:${email}?subject=Buncho%20partnership`} className="btn-primary mt-5">Become a partner</a>
        ) : (
          <p className="mt-4 text-sm text-muted">Contact us to become a partner.</p>
        )}
        <p className="mt-4 text-sm text-muted">
          See exactly how ranking works on the <Link href="/ranking" className="font-medium text-brand hover:underline">ranking page</Link>.
        </p>
      </section>
    </div>
  );
}
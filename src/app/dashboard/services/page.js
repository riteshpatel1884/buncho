import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/user";
import ServiceForm from "@/components/ServiceForm";
import SubmitButton from "@/components/SubmitButton";
import { toggleService, deleteService } from "../actions";
import { SERVICE_TYPES, inr } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "Services | buncho" };

export default async function ServicesPage() {
  const user = await requireRole("EXPERT", "/dashboard/services");
  const services = await prisma.service.findMany({
    where: { expert: { userId: user.id } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-ink">Back to dashboard</Link>
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Your services</h1>
        <p className="mt-1 text-muted">Start with one or two. Resume reviews and mock interviews are the most booked.</p>
      </div>

      <section className="card p-5 sm:p-6">
        <h2 className="mb-4 font-display text-xl font-bold">Add a service</h2>
        <ServiceForm />
      </section>

      {services.length > 0 && (
        <ul className="space-y-3">
          {services.map((s) => (
            <li key={s.id} className="card p-5">
              <div className="flex flex-wrap items-center gap-3">
                <div className="min-w-0 flex-1">
                  <span className="chip">{SERVICE_TYPES[s.type]}</span>
                  <p className="mt-1 truncate font-semibold">{s.title}</p>
                  <p className="text-sm text-muted">{inr(s.priceInr)}, {s.durationMin} min</p>
                </div>
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${s.active ? "bg-brand-soft text-brand" : "bg-surface-2 text-muted"}`}>{s.active ? "Visible" : "Hidden"}</span>
                <form action={toggleService}>
                  <input type="hidden" name="id" value={s.id} />
                  <SubmitButton className="btn-outline !px-4 !py-1.5" pendingText="Saving">{s.active ? "Hide" : "Show"}</SubmitButton>
                </form>
                <form action={deleteService}>
                  <input type="hidden" name="id" value={s.id} />
                  <SubmitButton className="btn-outline !px-4 !py-1.5" pendingText="Removing">Delete</SubmitButton>
                </form>
              </div>
              <details className="mt-4 border-t border-line pt-4">
                <summary className="cursor-pointer text-sm font-medium text-brand">Edit</summary>
                <div className="mt-4"><ServiceForm service={s} /></div>
              </details>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

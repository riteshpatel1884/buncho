import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { buildSlots } from "@/lib/slots";
import { SERVICE_TYPES, inr } from "@/lib/constants";
import Avatar from "@/components/Avatar";
import VerificationBadges from "@/components/Badges";
import BookingPicker from "@/components/BookingPicker";

export const dynamic = "force-dynamic";
export const metadata = { title: "Book a session | buncho" };

export default async function BookPage({ params }) {
  const { serviceId } = await params;
  const user = await requireUser(`/book/${serviceId}`);
  if (!user.role) redirect("/onboarding");

  const service = await prisma.service.findFirst({
    where: { id: serviceId, active: true, expert: { status: "ACTIVE" } },
    include: {
      expert: { include: { user: { select: { id: true, name: true, avatarUrl: true } }, availability: true } },
    },
  });
  if (!service) notFound();
  const expert = service.expert;

  if (user.role !== "STUDENT" || expert.user.id === user.id) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Booking is for student accounts</h1>
        <p className="mt-2 text-muted">You're signed in as an expert, so you can't book sessions.</p>
        <Link href="/dashboard" className="btn-primary mt-6">Go to dashboard</Link>
      </div>
    );
  }

  const horizon = new Date(Date.now() + 16 * 24 * 60 * 60 * 1000);
  const busy = await prisma.booking.findMany({
    where: { expertId: expert.id, status: { in: ["PENDING", "CONFIRMED"] }, startsAt: { lt: horizon } },
    select: { startsAt: true, endsAt: true },
  });
  const days = buildSlots({ availability: expert.availability, busy, durationMin: service.durationMin });

  return (
    <div className="space-y-6">
      <Link href={`/experts/${expert.slug}`} className="text-sm font-medium text-muted hover:text-ink">Back to {expert.user.name}</Link>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Book a session</h1>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        <BookingPicker serviceId={service.id} days={days} />

        <aside className="space-y-4 lg:order-last">
          <div className="card p-5">
            <span className="chip">{SERVICE_TYPES[service.type]}</span>
            <h2 className="mt-2 font-display text-xl font-bold">{service.title}</h2>
            <p className="mt-1 text-sm text-muted">{service.description}</p>
            <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
              <span className="text-sm text-muted">{service.durationMin} minutes</span>
              <span className="font-display text-3xl font-bold">{inr(service.priceInr)}</span>
            </div>
            {service.deliverables.length > 0 && (
              <ul className="mt-4 space-y-1 text-sm">
                {service.deliverables.map((d) => <li key={d} className="flex gap-2"><span className="text-brand">✓</span>{d}</li>)}
              </ul>
            )}
          </div>
          <div className="card flex items-center gap-3 p-5">
            <Avatar name={expert.user.name} src={expert.user.avatarUrl} size={48} />
            <div className="min-w-0">
              <p className="truncate font-semibold">{expert.user.name}</p>
              <p className="truncate text-xs text-muted">{expert.jobTitle} at {expert.company}</p>
              <div className="mt-1 flex flex-wrap gap-1"><VerificationBadges expert={expert} /></div>
            </div>
          </div>
          <p className="rounded-xl bg-surface-2 p-4 text-xs text-muted">
            Online payments are coming soon. For now your request goes to the expert, who confirms the time and shares a meeting link.
          </p>
        </aside>
      </div>
    </div>
  );
}

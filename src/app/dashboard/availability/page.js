import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/user";
import AvailabilityForm from "@/components/AvailabilityForm";
import SubmitButton from "@/components/SubmitButton";
import { deleteAvailability } from "../actions";
import { WEEKDAYS, fmtMinutes } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "Availability | buncho" };

export default async function AvailabilityPage() {
  const user = await requireRole("EXPERT", "/dashboard/availability");
  const windows = await prisma.availability.findMany({
    where: { expert: { userId: user.id } },
    orderBy: [{ weekday: "asc" }, { startMin: "asc" }],
  });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-ink">Back to dashboard</Link>
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Availability</h1>
        <p className="mt-1 text-muted">Students can book you inside these weekly windows. Times are in India time (IST).</p>
      </div>

      <AvailabilityForm />

      {windows.length === 0 ? (
        <div className="card border-dashed p-8 text-center text-muted">No windows yet. Add one so students can book you.</div>
      ) : (
        <ul className="space-y-2">
          {windows.map((w) => (
            <li key={w.id} className="card flex items-center justify-between gap-3 p-4">
              <p><span className="font-semibold">{WEEKDAYS[w.weekday]}</span> <span className="text-muted">{fmtMinutes(w.startMin)} to {fmtMinutes(w.endMin)}</span></p>
              <form action={deleteAvailability}>
                <input type="hidden" name="id" value={w.id} />
                <SubmitButton className="btn-outline !px-4 !py-1.5" pendingText="Removing">Remove</SubmitButton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

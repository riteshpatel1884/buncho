import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import Avatar from "@/components/Avatar";
import StatusBadge from "@/components/StatusBadge";
import SubmitButton from "@/components/SubmitButton";
import { confirmBooking, declineBooking, completeBooking, cancelBooking } from "./actions";
import { fmtDateTime, inr } from "@/lib/constants";
import { FIELD_LABELS } from "@/lib/review";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard | buncho" };

function Section({ title, count, children }) {
  return (
    <section className="space-y-3">
      <h2 className="font-display text-xl font-bold">{title} {count !== undefined && <span className="text-sm font-normal text-muted">({count})</span>}</h2>
      {children}
    </section>
  );
}

function Empty({ children }) {
  return <div className="card border-dashed p-6 text-center text-sm text-muted">{children}</div>;
}

function CancelForm({ id }) {
  return (
    <form action={cancelBooking}>
      <input type="hidden" name="id" value={id} />
      <SubmitButton className="btn-outline !px-4 !py-1.5" pendingText="Cancelling">Cancel</SubmitButton>
    </form>
  );
}

// ---------- Student ----------
async function StudentView({ user, sp }) {
  const [profile, bookings] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { userId: user.id } }),
    prisma.booking.findMany({
      where: { studentId: user.id },
      orderBy: { startsAt: "desc" },
      include: { service: true, expert: { include: { user: { select: { name: true, avatarUrl: true } } } } },
    }),
  ]);
  const now = new Date();
  const upcoming = bookings.filter((b) => ["PENDING", "CONFIRMED"].includes(b.status) && b.endsAt >= now).reverse();
  const past = bookings.filter((b) => !upcoming.includes(b));

  const row = (b) => (
    <li key={b.id} className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar name={b.expert.user.name} src={b.expert.user.avatarUrl} size={44} />
        <div className="min-w-0 flex-1">
          <Link href={`/experts/${b.expert.slug}`} className="block truncate font-semibold hover:underline">{b.expert.user.name}</Link>
          <p className="truncate text-sm text-muted">{b.service.title}, {inr(b.priceInr)}</p>
          <p className="text-sm">{fmtDateTime(b.startsAt)} IST</p>
        </div>
        <StatusBadge status={b.status} />
      </div>
      {b.status === "CONFIRMED" && (
        <p className="mt-3 text-sm">
          {b.meetingUrl ? <a href={b.meetingUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline">Join the session</a> : <span className="text-muted">The expert will share a meeting link here.</span>}
        </p>
      )}
      {["PENDING", "CONFIRMED"].includes(b.status) && b.endsAt >= now && <div className="mt-3"><CancelForm id={b.id} /></div>}
    </li>
  );

  return (
    <div className="space-y-8">
      {sp.booked && <p role="status" className="rounded-xl bg-brand-soft p-4 text-sm font-medium text-brand">Request sent. The expert will confirm your session soon.</p>}

      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="min-w-0">
          <p className="font-semibold">{profile?.college}, {profile?.branch}, {profile?.year}</p>
          <p className="text-sm text-muted">Target: {profile?.targetRole}</p>
        </div>
        <div className="flex gap-2">
          <Link href="/dashboard/profile" className="btn-outline">Edit profile</Link>
          <Link href="/experts" className="btn-primary">Find experts</Link>
        </div>
      </div>

      <Section title="Upcoming" count={upcoming.length}>
        {upcoming.length === 0 ? <Empty>No sessions booked. <Link href="/experts" className="font-medium text-brand hover:underline">Find an expert</Link></Empty> : <ul className="space-y-3">{upcoming.map(row)}</ul>}
      </Section>
      {past.length > 0 && <Section title="Past" count={past.length}><ul className="space-y-3">{past.map(row)}</ul></Section>}
    </div>
  );
}

// ---------- Expert ----------
async function ExpertView({ user, sp }) {
  const expert = await prisma.expertProfile.findUnique({
    where: { userId: user.id },
    include: { _count: { select: { services: true, availability: true } } },
  });
  if (!expert) redirect("/onboarding/expert");

  const bookings = await prisma.booking.findMany({
    where: { expertId: expert.id },
    orderBy: { startsAt: "asc" },
    include: { service: true, student: { include: { studentProfile: true } } },
  });
  const now = new Date();
  const requests = bookings.filter((b) => b.status === "PENDING" && b.endsAt >= now);
  const upcoming = bookings.filter((b) => b.status === "CONFIRMED" && b.endsAt >= now);
  const past = bookings.filter((b) => !requests.includes(b) && !upcoming.includes(b)).reverse();
  const completed = bookings.filter((b) => b.status === "COMPLETED");
  const earned = completed.reduce((sum, b) => sum + b.priceInr, 0);

  const studentLine = (b) => {
    const p = b.student.studentProfile;
    return p ? `${b.student.name || "Student"}, ${p.college}, ${p.year}. Target: ${p.targetRole}` : b.student.name || "Student";
  };

  const stats = [["Requests", requests.length], ["Upcoming", upcoming.length], ["Completed", completed.length], ["Total value", inr(earned)]];
  const todo = [];
  if (expert._count.services === 0) todo.push(["Add a service", "/dashboard/services"]);
  if (expert._count.availability === 0) todo.push(["Set your availability", "/dashboard/availability"]);

  return (
    <div className="space-y-8">
      {sp.welcome === "expert" && <p role="status" className="rounded-xl bg-brand-soft p-4 text-sm font-medium text-brand">Profile submitted. Buncho will check your details, then your profile goes live.</p>}
      {expert.status === "PENDING" && <p className="rounded-xl bg-warn-soft p-4 text-sm text-warn">Your profile is under review. Students can't see it yet. Add your services and availability while you wait.</p>}
      {expert.status === "SUSPENDED" && <p className="rounded-xl bg-danger-soft p-4 text-sm text-danger">Your profile is suspended. Contact the Buncho team.</p>}
      {expert.unverifiedFields?.length > 0 && (
        <p className="rounded-xl bg-warn-soft p-4 text-sm text-warn">
          You changed your {expert.unverifiedFields.map((f) => FIELD_LABELS[f]).join(", ")}. It shows as "Not verified" until the Buncho team checks it again.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {stats.map(([label, value], i) => (
          <div key={label} className="card rise p-4 sm:p-5" style={{ "--i": i }}>
            <p className="font-display text-2xl font-bold sm:text-3xl">{value}</p>
            <p className="mt-1 text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Link href="/dashboard/services" className="btn-outline">Services</Link>
        <Link href="/dashboard/availability" className="btn-outline">Availability</Link>
        <Link href="/dashboard/profile" className="btn-outline">Edit profile</Link>
        <Link href="/dashboard/verification" className="btn-outline">Blue tick</Link>
        <Link href={`/experts/${expert.slug}`} className="btn-outline">View public profile</Link>
      </div>

      {todo.length > 0 && (
        <div className="card p-5 text-sm">
          <p className="font-semibold">To get booked</p>
          <ul className="mt-2 space-y-1">{todo.map(([t, h]) => <li key={h}><Link href={h} className="font-medium text-brand hover:underline">{t}</Link></li>)}</ul>
        </div>
      )}

      <Section title="Booking requests" count={requests.length}>
        {requests.length === 0 ? <Empty>No pending requests.</Empty> : (
          <ul className="space-y-3">
            {requests.map((b) => (
              <li key={b.id} className="card p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{b.service.title}, {inr(b.priceInr)}</p>
                    <p className="text-sm">{fmtDateTime(b.startsAt)} IST ({b.service.durationMin} min)</p>
                    <p className="mt-1 text-sm text-muted">{studentLine(b)}</p>
                    {b.note && <p className="mt-2 rounded-xl bg-surface-2 p-3 text-sm">{b.note}</p>}
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="mt-4 flex flex-wrap items-end gap-3 border-t border-line pt-4">
                  <form action={confirmBooking} className="flex flex-1 flex-wrap items-end gap-2">
                    <input type="hidden" name="id" value={b.id} />
                    <label className="min-w-[200px] flex-1 text-xs text-muted">Meeting link (optional)
                      <input name="meetingUrl" type="url" placeholder="https://meet.google.com/..." className="input mt-1" />
                    </label>
                    <SubmitButton className="btn-primary" pendingText="Confirming">Confirm</SubmitButton>
                  </form>
                  <form action={declineBooking}>
                    <input type="hidden" name="id" value={b.id} />
                    <SubmitButton className="btn-outline" pendingText="Declining">Decline</SubmitButton>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Upcoming sessions" count={upcoming.length}>
        {upcoming.length === 0 ? <Empty>Nothing confirmed yet.</Empty> : (
          <ul className="space-y-3">
            {upcoming.map((b) => (
              <li key={b.id} className="card p-4 sm:p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{b.service.title}</p>
                    <p className="text-sm">{fmtDateTime(b.startsAt)} IST</p>
                    <p className="text-sm text-muted">{studentLine(b)}</p>
                    {b.meetingUrl && <a href={b.meetingUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-brand hover:underline">Meeting link</a>}
                  </div>
                  <div className="flex gap-2">
                    {b.startsAt <= now && (
                      <form action={completeBooking}>
                        <input type="hidden" name="id" value={b.id} />
                        <SubmitButton className="btn-primary" pendingText="Saving">Mark completed</SubmitButton>
                      </form>
                    )}
                    <CancelForm id={b.id} />
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      {past.length > 0 && (
        <Section title="History" count={past.length}>
          <ul className="space-y-3">
            {past.map((b) => (
              <li key={b.id} className="card flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{b.service.title}</p>
                  <p className="text-sm text-muted">{fmtDateTime(b.startsAt)} IST, {b.student.name || "Student"}</p>
                </div>
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        </Section>
      )}
    </div>
  );
}

export default async function Dashboard({ searchParams }) {
  const sp = await searchParams;
  const user = await requireUser("/dashboard");
  if (!user.role) redirect("/onboarding");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{user.role === "EXPERT" ? "Expert dashboard" : "My sessions"}</h1>
        <p className="mt-1 text-muted">{user.name ? `Welcome, ${user.name.split(" ")[0]}.` : "Welcome."}</p>
      </div>
      {user.role === "EXPERT" ? <ExpertView user={user} sp={sp} /> : <StudentView user={user} sp={sp} />}
    </div>
  );
}
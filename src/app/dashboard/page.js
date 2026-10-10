import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { dodo } from "@/lib/dodo";
import { applyBookingPayment, HOLD_MINUTES } from "@/lib/bookingPayment";
import Avatar from "@/components/Avatar";
import StatusBadge from "@/components/StatusBadge";
import SubmitButton from "@/components/SubmitButton";
import ReplyForm from "@/components/ReplyForm";
import { confirmBooking, declineBooking, cancelBooking } from "./actions";
import { fmtDateTime, inr } from "@/lib/constants";
import { FIELD_LABELS } from "@/lib/review";

export const dynamic = "force-dynamic";
export const metadata = { title: "Dashboard | buncho" };

const REPLY_STATUS = {
  PENDING: ["Waiting for Buncho's review", "bg-warn-soft text-warn"],
  SENDING: ["Waiting for Buncho's review", "bg-warn-soft text-warn"],
  SEND_FAILED: ["Waiting for Buncho's review", "bg-warn-soft text-warn"],
  SENT: ["Sent to the student", "bg-brand-soft text-brand"],
  REJECTED: ["Not sent", "bg-danger-soft text-danger"],
};
const OPEN_REPLY = ["PENDING", "SENDING", "SEND_FAILED"];

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

// What happened to the student's money when a request was declined or cancelled.
function refundLine(b) {
  if (b.paymentStatus === "REFUNDED") return `Your payment of ${inr(b.priceInr)} has been refunded to your original payment method.`;
  if (b.paymentStatus === "REFUND_FAILED") return "We couldn't start your refund automatically. The Buncho team is fixing this and will email you.";
  if (b.paymentStatus === "PAID") {
    if (b.resolvedAt) return "Buncho reviewed this cancellation and the payment was kept.";
    return b.cancelledBy === "STUDENT" ? "Buncho is reviewing your refund and will email you." : "Your refund is being processed.";
  }
  if (b.paymentStatus === "FREE") return "Nothing was charged.";
  return "";
}

function endedLine(b) {
  if (b.status === "DECLINED") return "The expert couldn't take this request.";
  if (b.cancelledBy === "EXPERT") return "The expert cancelled this request.";
  if (b.cancelledBy === "STUDENT") return "You cancelled this request.";
  return "This request was cancelled.";
}

// ---------- Student ----------
async function StudentView({ user, sp }) {
  const [profile, bookings] = await Promise.all([
    prisma.studentProfile.findUnique({ where: { userId: user.id } }),
    prisma.booking.findMany({
      where: { studentId: user.id },
      orderBy: { createdAt: "desc" },
      include: {
        service: true,
        expert: { include: { user: { select: { name: true, avatarUrl: true } } } },
        replies: { where: { status: "SENT" }, orderBy: { sentAt: "asc" } },
      },
    }),
  ]);
  const now = new Date();
  const holdCutoff = new Date(now.getTime() - HOLD_MINUTES * 60000);
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Unpaid requests are not real requests. Only show one while its payment can still go through.
  const shown = bookings.filter((b) => b.paymentStatus !== "UNPAID" || (b.status === "PENDING" && b.createdAt > holdCutoff));
  const open = shown.filter((b) => ["PENDING", "CONFIRMED"].includes(b.status));
  const done = shown.filter((b) => !open.includes(b));

  // Recent declines and expert cancellations, shown on top so they are not missed.
  const alerts = shown.filter(
    (b) => ["DECLINED", "CANCELLED"].includes(b.status) && b.cancelledBy === "EXPERT" && b.statusChangedAt && b.statusChangedAt > weekAgo
  );

  const row = (b) => (
    <li key={b.id} className="card p-4 sm:p-5">
      <div className="flex flex-wrap items-center gap-3">
        <Avatar name={b.expert.user.name} src={b.expert.user.avatarUrl} size={44} />
        <div className="min-w-0 flex-1">
          <Link href={`/experts/${b.expert.slug}`} className="block truncate font-semibold hover:underline">{b.expert.user.name}</Link>
          <p className="truncate text-sm text-muted">{b.service.title}, {inr(b.priceInr)}</p>
          <p className="text-xs text-muted">Requested {fmtDateTime(b.createdAt)} IST</p>
        </div>
        <StatusBadge status={b.status} />
      </div>

      {b.status === "PENDING" && (
        <p className="mt-3 text-sm text-muted">
          {b.paymentStatus === "UNPAID"
            ? `Waiting for your payment to go through. This request stays here for ${HOLD_MINUTES} minutes.`
            : "Paid. Waiting for the expert to accept."}
        </p>
      )}
      {b.status === "CONFIRMED" && (
        <p className="mt-3 text-sm text-muted">
          The expert accepted. Their reply is emailed to you once Buncho has checked it, and it shows here too.
        </p>
      )}
      {["DECLINED", "CANCELLED"].includes(b.status) && (
        <p className={`mt-3 rounded-xl p-3 text-sm ${b.cancelledBy === "STUDENT" ? "bg-surface-2 text-muted" : "bg-danger-soft text-danger"}`}>
          {endedLine(b)} {refundLine(b)}
        </p>
      )}

      {b.replies.map((r) => (
        <div key={r.id} className="mt-3 rounded-xl border border-line bg-surface-2 p-4">
          <p className="text-xs text-muted">Reply from {b.expert.user.name}{r.sentAt ? `, ${fmtDateTime(r.sentAt)} IST` : ""}</p>
          <p className="mt-2 whitespace-pre-line break-words text-sm">{r.body}</p>
        </div>
      ))}

      {["PENDING", "CONFIRMED"].includes(b.status) && (
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <CancelForm id={b.id} />
          {b.status === "CONFIRMED" && b.paymentStatus === "PAID" && (
            <p className="text-xs text-muted">After the expert accepts, Buncho reviews a cancellation before any refund.</p>
          )}
        </div>
      )}
    </li>
  );

  return (
    <div className="space-y-8">
      {sp.booked && <p role="status" className="rounded-xl bg-brand-soft p-4 text-sm font-medium text-brand">Request sent. The expert will accept it soon.</p>}

      {alerts.length > 0 && (
        <div className="space-y-3">
          {alerts.map((b) => (
            <div key={b.id} role="alert" className="rounded-xl bg-danger-soft p-4 text-sm text-danger">
              <p className="font-semibold">{b.expert.user.name} {b.status === "DECLINED" ? "declined" : "cancelled"} your request</p>
              <p className="mt-1">{b.service.title}.</p>
              {refundLine(b) && <p className="mt-1">{refundLine(b)}</p>}
              <Link href="/experts" className="mt-2 inline-block font-medium underline">Find another expert</Link>
            </div>
          ))}
        </div>
      )}

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

      <Section title="In progress" count={open.length}>
        {open.length === 0 ? <Empty>Nothing in progress. <Link href="/experts" className="font-medium text-brand hover:underline">Find an expert</Link></Empty> : <ul className="space-y-3">{open.map(row)}</ul>}
      </Section>
      {done.length > 0 && <Section title="Done" count={done.length}><ul className="space-y-3">{done.map(row)}</ul></Section>}
    </div>
  );
}

// ---------- Expert ----------
async function ExpertView({ user, sp }) {
  const expert = await prisma.expertProfile.findUnique({
    where: { userId: user.id },
    include: { _count: { select: { services: true } } },
  });
  if (!expert) redirect("/onboarding/expert");

  // Unpaid requests never reach the expert.
  const bookings = await prisma.booking.findMany({
    where: { expertId: expert.id, paymentStatus: { not: "UNPAID" } },
    orderBy: { createdAt: "asc" },
    include: {
      service: true,
      student: { include: { studentProfile: true } },
      replies: { orderBy: { createdAt: "asc" } },
    },
  });
  const requests = bookings.filter((b) => b.status === "PENDING");
  const accepted = bookings.filter((b) => b.status === "CONFIRMED");
  const past = bookings.filter((b) => !requests.includes(b) && !accepted.includes(b)).reverse();
  const completed = bookings.filter((b) => b.status === "COMPLETED");
  const earned = completed.reduce((sum, b) => sum + b.priceInr, 0);

  const studentLine = (b) => {
    const p = b.student.studentProfile;
    return p ? `${b.student.name || "Student"}, ${p.college}, ${p.year}. Target: ${p.targetRole}` : b.student.name || "Student";
  };

  const stats = [["Requests", requests.length], ["Accepted", accepted.length], ["Completed", completed.length], ["Total value", inr(earned)]];
  const todo = [];
  if (expert._count.services === 0) todo.push(["Add a service", "/dashboard/services"]);

  return (
    <div className="space-y-8">
      {sp.welcome === "expert" && <p role="status" className="rounded-xl bg-brand-soft p-4 text-sm font-medium text-brand">Profile submitted. Buncho will check your details, then your profile goes live.</p>}
      {expert.status === "PENDING" && <p className="rounded-xl bg-warn-soft p-4 text-sm text-warn">Your profile is under review. Students can't see it yet. Add your services while you wait.</p>}
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

      <Section title="Requests" count={requests.length}>
        {requests.length === 0 ? <Empty>No pending requests.</Empty> : (
          <ul className="space-y-3">
            {requests.map((b) => (
              <li key={b.id} className="card p-4 sm:p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-semibold">{b.service.title}, {inr(b.priceInr)}</p>
                    <p className="text-xs text-muted">Requested {fmtDateTime(b.createdAt)} IST</p>
                    <p className="mt-1 text-sm text-muted">{studentLine(b)}</p>
                    {b.note && <p className="mt-2 whitespace-pre-line break-words rounded-xl bg-surface-2 p-3 text-sm">{b.note}</p>}
                  </div>
                  <StatusBadge status={b.status} />
                </div>
                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
                  <form action={confirmBooking}>
                    <input type="hidden" name="id" value={b.id} />
                    <SubmitButton className="btn-primary" pendingText="Accepting">Accept</SubmitButton>
                  </form>
                  <form action={declineBooking}>
                    <input type="hidden" name="id" value={b.id} />
                    <SubmitButton className="btn-outline" pendingText="Declining">Decline</SubmitButton>
                  </form>
                  {b.paymentStatus === "PAID" && <p className="text-xs text-muted">If you decline, the student is refunded in full.</p>}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Accepted requests" count={accepted.length}>
        {accepted.length === 0 ? <Empty>Nothing accepted yet.</Empty> : (
          <ul className="space-y-3">
            {accepted.map((b) => {
              const waiting = b.replies.some((r) => OPEN_REPLY.includes(r.status));
              return (
                <li key={b.id} className="card space-y-4 p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{b.service.title}</p>
                      <p className="text-sm text-muted">{studentLine(b)}</p>
                    </div>
                    <CancelForm id={b.id} />
                  </div>

                  {b.note && (
                    <div>
                      <p className="text-xs text-muted">The student wrote</p>
                      <p className="mt-1 whitespace-pre-line break-words rounded-xl bg-surface-2 p-3 text-sm">{b.note}</p>
                    </div>
                  )}

                  {b.replies.length > 0 && (
                    <ul className="space-y-2">
                      {b.replies.map((r) => {
                        const [label, cls] = REPLY_STATUS[r.status] ?? REPLY_STATUS.PENDING;
                        return (
                          <li key={r.id} className="rounded-xl border border-line p-3 text-sm">
                            <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}`}>{label}</span>
                            <p className="mt-2 line-clamp-3 whitespace-pre-line break-words text-muted">{r.body}</p>
                            {r.status === "REJECTED" && r.adminNote && <p className="mt-2 text-danger">Buncho: {r.adminNote}</p>}
                          </li>
                        );
                      })}
                    </ul>
                  )}

                  {waiting ? (
                    <p className="text-sm text-muted">Your reply is with Buncho for review. When it is approved and sent, this request is completed.</p>
                  ) : (
                    <ReplyForm bookingId={b.id} />
                  )}
                </li>
              );
            })}
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
                  <p className="text-sm text-muted">{fmtDateTime(b.createdAt)} IST, {b.student.name || "Student"}</p>
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

  // Coming back from Dodo checkout: confirm the payment now, in case the webhook is late or can't reach this server.
  const paymentId = typeof sp.payment_id === "string" ? sp.payment_id : null;
  if (paymentId && user.role === "STUDENT") {
    try {
      const payment = await dodo.payments.retrieve(paymentId);
      const res = await applyBookingPayment(payment, { studentId: user.id });
      console.log("[booking] payment sync", paymentId, res);
    } catch (e) {
      console.error("[booking] payment sync failed:", e?.message);
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">{user.role === "EXPERT" ? "Expert dashboard" : "My requests"}</h1>
        <p className="mt-1 text-muted">{user.name ? `Welcome, ${user.name.split(" ")[0]}.` : "Welcome."}</p>
      </div>
      {user.role === "EXPERT" ? <ExpertView user={user} sp={sp} /> : <StudentView user={user} sp={sp} />}
    </div>
  );
}
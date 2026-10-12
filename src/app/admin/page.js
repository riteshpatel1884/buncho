import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/user";
import Avatar from "@/components/Avatar";
import SubmitButton from "@/components/SubmitButton";
import StatusBadge from "@/components/StatusBadge";
import { fmtDateTime, inr } from "@/lib/constants";
import {
  setExpertStatus, toggleVerification, markReviewed,
  approveReply, rejectReply, approveRequest, rejectRequest,
  refundNow, keepPayment, releasePayout, resolveReport,
} from "./actions";
import { REVIEW_WHERE, REPLY_OPEN, REFUND_OPEN, REQUEST_OPEN, PAYOUT_DUE, REPORT_OPEN, FIELD_LABELS } from "@/lib/review";
import { PROBLEM_CATEGORIES, PERSON_CATEGORIES } from "@/lib/reports";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin | buncho" };

const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || "bunch.live";
const TABS = [
  ["INBOX", "Inbox"],
  ["COMPLETED", "Completed"],
  ["REPORTS", "Reports"],
  ["TRANSACTIONS", "Transactions"],
  ["PENDING", "To review"],
  ["ACTIVE", "Live"],
  ["SUSPENDED", "Suspended"],
];
const EXPERT_WHERE = {
  PENDING: REVIEW_WHERE,
  ACTIVE: { status: "ACTIVE", needsReview: false },
  SUSPENDED: { status: "SUSPENDED" },
};
const PAY_STATES = ["PAID", "REFUNDED", "REFUND_FAILED"];
const PAY_LABEL = { PAID: "Paid", REFUNDED: "Refunded", REFUND_FAILED: "Refund failed", FREE: "Free" };
const PAY_CLASS = {
  PAID: "bg-brand-soft text-brand",
  REFUNDED: "bg-surface-2 text-muted",
  REFUND_FAILED: "bg-danger-soft text-danger",
  FREE: "bg-surface-2 text-muted",
};

const bookingInclude = {
  student: { select: { name: true, email: true } },
  service: { select: { title: true } },
  expert: { select: { slug: true, user: { select: { name: true, email: true } } } },
};

function whoEnded(b) {
  if (b.status === "DECLINED") return "Declined by the expert";
  if (b.cancelledBy === "EXPERT") return "Cancelled by the expert";
  if (b.cancelledBy === "STUDENT") return "Cancelled by the student";
  if (b.cancelledBy === "ADMIN") return "Rejected by Buncho";
  return "Cancelled";
}

const reportInclude = {
  reporter: { select: { name: true, username: true, email: true, role: true } },
  target: { select: { name: true, username: true, email: true, role: true, expertProfile: { select: { slug: true } } } },
  booking: { select: { id: true, status: true, paymentStatus: true, priceInr: true, cashfreeOrderId: true, service: { select: { title: true } } } },
};

const catLabel = (r) => (r.kind === "PERSON" ? PERSON_CATEGORIES : PROBLEM_CATEGORIES)[r.category] ?? r.category;
const who = (u) => `${u.name || "No name"}${u.username ? ` @${u.username}` : ""} (${u.email}), ${u.role ? u.role.toLowerCase() : "no role"}`;

function payoutLine(b) {
  if (b.payoutReleasedAt) return `Released ${fmtDateTime(b.payoutReleasedAt)} IST${b.payoutNote ? `, ref ${b.payoutNote}` : ""}`;
  if (b.paymentStatus === "PAID" && b.status === "COMPLETED") return "Due to the expert";
  if (b.paymentStatus === "PAID") return `Not yet (request is ${b.status.toLowerCase()})`;
  return "None";
}

function Heading({ title, n, hint }) {
  return (
    <h2 className="font-display text-xl font-bold">
      {title} {n !== undefined && <span className="text-sm font-normal text-muted">({n})</span>}
      {hint && <span className="ml-2 text-sm font-normal text-muted">{hint}</span>}
    </h2>
  );
}

function Empty({ children }) {
  return <div className="card border-dashed p-8 text-center text-muted">{children}</div>;
}

export default async function Admin({ searchParams }) {
  if (!(await isAdmin())) notFound();
  const sp = await searchParams;
  const status = TABS.some(([s]) => s === sp.status) ? sp.status : "INBOX";
  const q = String(sp.q || "").trim().slice(0, 80);
  const pay = PAY_STATES.includes(sp.pay) ? sp.pay : "";
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [requestsCount, repliesCount, refundsCount, payoutsCount, reviewCount, liveCount, suspendedCount, students, bookingsTotal, reportsCount] =
    await Promise.all([
      prisma.booking.count({ where: REQUEST_OPEN }),
      prisma.bookingReply.count({ where: REPLY_OPEN }),
      prisma.booking.count({ where: REFUND_OPEN }),
      prisma.booking.count({ where: PAYOUT_DUE }),
      prisma.expertProfile.count({ where: EXPERT_WHERE.PENDING }),
      prisma.expertProfile.count({ where: EXPERT_WHERE.ACTIVE }),
      prisma.expertProfile.count({ where: EXPERT_WHERE.SUSPENDED }),
      prisma.user.count({ where: { role: "STUDENT" } }),
      prisma.booking.count(),
      prisma.report.count({ where: REPORT_OPEN }),
    ]);
  const count = {
    INBOX: requestsCount + repliesCount + refundsCount,
    COMPLETED: payoutsCount,
    REPORTS: reportsCount,
    TRANSACTIONS: null,
    PENDING: reviewCount,
    ACTIVE: liveCount,
    SUSPENDED: suspendedCount,
  };

  const inbox = status === "INBOX";
  const requests = inbox
    ? await prisma.booking.findMany({ where: REQUEST_OPEN, orderBy: { createdAt: "asc" }, include: bookingInclude })
    : [];
  const replies = inbox
    ? await prisma.bookingReply.findMany({
        where: REPLY_OPEN,
        orderBy: { createdAt: "asc" },
        include: { booking: { include: bookingInclude } },
      })
    : [];
  const refunds = inbox
    ? await prisma.booking.findMany({ where: REFUND_OPEN, orderBy: { statusChangedAt: "asc" }, include: bookingInclude })
    : [];
  const recent = inbox
    ? (
        await prisma.booking.findMany({
          where: { status: { in: ["CANCELLED", "DECLINED"] }, paymentStatus: { not: "UNPAID" }, statusChangedAt: { gte: since } },
          orderBy: { statusChangedAt: "desc" },
          take: 40,
          include: bookingInclude,
        })
      ).filter((b) => !refunds.some((r) => r.id === b.id))
    : [];

  const due = status === "COMPLETED"
    ? await prisma.booking.findMany({ where: PAYOUT_DUE, orderBy: { statusChangedAt: "asc" }, include: bookingInclude })
    : [];
  const released = status === "COMPLETED"
    ? await prisma.booking.findMany({
        where: { status: "COMPLETED", payoutReleasedAt: { not: null } },
        orderBy: { payoutReleasedAt: "desc" },
        take: 20,
        include: bookingInclude,
      })
    : [];

  const reports = status === "REPORTS"
    ? await prisma.report.findMany({ where: REPORT_OPEN, orderBy: { createdAt: "asc" }, include: reportInclude })
    : [];
  const resolvedReports = status === "REPORTS"
    ? await prisma.report.findMany({ where: { status: "RESOLVED" }, orderBy: { resolvedAt: "desc" }, take: 15, include: reportInclude })
    : [];

  const text = (f) => ({ [f]: { contains: q, mode: "insensitive" } });
  const [txns, totals] = status === "TRANSACTIONS"
    ? await Promise.all([
        prisma.booking.findMany({
          where: {
            paymentStatus: { in: pay ? [pay] : PAY_STATES },
            ...(q
              ? { OR: [text("cashfreeOrderId"), { id: q }, { student: text("email") }, { student: text("name") }, { expert: { user: text("name") } }, { service: text("title") }] }
              : {}),
          },
          orderBy: { createdAt: "desc" },
          take: 100,
          include: bookingInclude,
        }),
        prisma.booking.groupBy({
          by: ["paymentStatus"],
          where: { paymentStatus: { in: PAY_STATES } },
          _sum: { priceInr: true },
          _count: { _all: true },
        }),
      ])
    : [[], []];
  const total = (s) => totals.find((t) => t.paymentStatus === s);

  const experts = EXPERT_WHERE[status]
    ? await prisma.expertProfile.findMany({
        where: EXPERT_WHERE[status],
        orderBy: { createdAt: status === "PENDING" ? "asc" : "desc" },
        include: { user: { select: { name: true, email: true, avatarUrl: true } }, _count: { select: { services: true, bookings: true } } },
      })
    : [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Admin</h1>
        <p className="mt-1 text-muted">Requests and replies to approve, refunds, payouts, reports, transactions and expert checks, all here. {students} students, {bookingsTotal} bookings so far.</p>
      </div>

      <div className="no-scrollbar flex w-full max-w-full overflow-x-auto rounded-full border border-line bg-surface p-1 text-sm font-medium sm:w-fit">
        {TABS.map(([s, label]) => (
          <Link key={s} href={`/admin?status=${s}`} className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 sm:px-4 ${status === s ? "bg-brand text-on-brand" : "text-muted hover:text-ink"}`}>
            {label}{count[s] !== null ? ` (${count[s]})` : ""}
          </Link>
        ))}
      </div>

      {/* ---------- Inbox ---------- */}
      {inbox && (
        <div className="space-y-10">
          <section className="space-y-3">
            <Heading title="Requests to approve" n={requests.length} hint="the expert sees them only after you approve" />
            {requests.length === 0 ? (
              <Empty>No requests waiting.</Empty>
            ) : (
              <ul className="space-y-4">
                {requests.map((b) => (
                  <li key={b.id} className="card space-y-4 p-5 sm:p-6">
                    <div>
                      <p className="font-semibold">
                        {b.student.name || "Student"} <span className="font-normal text-muted">({b.student.email})</span> to {b.expert.user.name}
                      </p>
                      <p className="text-sm text-muted">
                        {b.service.title}, {inr(b.priceInr)}, {b.paymentStatus === "PAID" ? "paid" : "free"}, sent {fmtDateTime(b.paidAt ?? b.createdAt)} IST
                      </p>
                    </div>

                    {b.noteFlags.length > 0 && (
                      <p className="rounded-xl bg-warn-soft p-3 text-sm text-warn">
                        Possible contact info in the student's message: {b.noteFlags.join(", ")}. Edit it out, or reject.
                      </p>
                    )}

                    <form action={approveRequest} className="space-y-3">
                      <input type="hidden" name="id" value={b.id} />
                      <label className="block text-sm font-medium">
                        The student's message (you can edit it before the expert sees it)
                        <textarea name="note" required rows={6} minLength={10} maxLength={1000} defaultValue={b.note ?? ""} className="input mt-1.5" />
                      </label>
                      <SubmitButton className="btn-primary" pendingText="Sending">Approve and send to the expert</SubmitButton>
                    </form>

                    <form action={rejectRequest} className="flex flex-wrap items-end gap-2 border-t border-dashed border-line pt-4">
                      <input type="hidden" name="id" value={b.id} />
                      <label className="min-w-[220px] flex-1 text-xs text-muted">
                        Reason for the student (optional)
                        <input name="note" maxLength={300} placeholder="Please remove your phone number and links, then send it again" className="input mt-1" />
                      </label>
                      <SubmitButton className="btn-outline" pendingText="Rejecting">
                        {b.paymentStatus === "PAID" ? "Reject and refund" : "Reject"}
                      </SubmitButton>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <Heading title="Replies to approve" n={replies.length} />
            {replies.length === 0 ? (
              <Empty>No replies waiting.</Empty>
            ) : (
              <ul className="space-y-4">
                {replies.map((r) => (
                  <li key={r.id} className="card space-y-4 p-5 sm:p-6">
                    <div>
                      <p className="font-semibold">
                        {r.booking.expert.user.name} to {r.booking.student.name || "Student"}{" "}
                        <span className="font-normal text-muted">({r.booking.student.email})</span>
                      </p>
                      <p className="text-sm text-muted">{r.booking.service.title}, requested {fmtDateTime(r.booking.createdAt)} IST</p>
                    </div>

                    {r.flags.length > 0 && (
                      <p className="rounded-xl bg-warn-soft p-3 text-sm text-warn">
                        Possible contact info: {r.flags.join(", ")}. Check it, edit it out, or reject.
                      </p>
                    )}
                    {r.status === "SEND_FAILED" && (
                      <p className="rounded-xl bg-danger-soft p-3 text-sm text-danger">
                        The last email didn't go through. Check Resend and the sending domain, then approve again.
                      </p>
                    )}

                    {r.booking.note && (
                      <div>
                        <p className="text-xs text-muted">The student asked</p>
                        <p className="mt-1 whitespace-pre-line break-words rounded-xl bg-surface-2 p-3 text-sm">{r.booking.note}</p>
                      </div>
                    )}
                    {r.booking.followUpCount > 0 && r.booking.followUpNote && (
                      <div>
                        <p className="text-xs text-muted">The student's follow-up (number {r.booking.followUpCount})</p>
                        <p className="mt-1 whitespace-pre-line break-words rounded-xl bg-warn-soft p-3 text-sm text-warn">{r.booking.followUpNote}</p>
                      </div>
                    )}

                    <form action={approveReply} className="space-y-3">
                      <input type="hidden" name="id" value={r.id} />
                      <label className="block text-sm font-medium">
                        Reply (you can edit it before it is sent)
                        <textarea name="body" required rows={8} maxLength={4000} defaultValue={r.body} className="input mt-1.5" />
                      </label>
                      <p className="text-xs text-muted">
                        Goes to {r.booking.student.email} from {r.booking.expert.slug}@{EMAIL_DOMAIN}. The student then confirms it solved their question, or asks for a free follow-up.
                      </p>
                      <SubmitButton className="btn-primary" pendingText="Sending">Approve and send</SubmitButton>
                    </form>

                    <form action={rejectReply} className="flex flex-wrap items-end gap-2 border-t border-dashed border-line pt-4">
                      <input type="hidden" name="id" value={r.id} />
                      <label className="min-w-[220px] flex-1 text-xs text-muted">
                        Reason for the expert (optional)
                        <input name="note" maxLength={300} placeholder="Remove phone numbers and links, then send it again" className="input mt-1" />
                      </label>
                      <SubmitButton className="btn-outline" pendingText="Rejecting">Reject</SubmitButton>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <Heading title="Refunds to handle" n={refunds.length} />
            {refunds.length === 0 ? (
              <Empty>No refunds waiting.</Empty>
            ) : (
              <ul className="space-y-4">
                {refunds.map((b) => (
                  <li key={b.id} className="card space-y-3 p-5 sm:p-6">
                    <p className="font-semibold">
                      {b.student.name || "Student"} <span className="font-normal text-muted">({b.student.email})</span>
                    </p>
                    <p className="text-sm text-muted">{b.service.title} with {b.expert.user.name}, {inr(b.priceInr)}</p>
                    <p className="text-sm">{whoEnded(b)}. {PAY_LABEL[b.paymentStatus] ?? b.paymentStatus}.</p>
                    {b.cancelledBy === "STUDENT" && (
                      <p className="rounded-xl bg-warn-soft p-3 text-sm text-warn">The student cancelled after the expert accepted. Decide whether to refund.</p>
                    )}
                    {b.paymentStatus === "REFUND_FAILED" && (
                      <p className="rounded-xl bg-danger-soft p-3 text-sm text-danger">The automatic refund failed. Try again, or refund it from the Cashfree dashboard and press Keep payment to close this.</p>
                    )}
                    <div className="flex flex-wrap gap-2">
                      <form action={refundNow}>
                        <input type="hidden" name="id" value={b.id} />
                        <SubmitButton className="btn-primary" pendingText="Refunding">Refund {inr(b.priceInr)}</SubmitButton>
                      </form>
                      <form action={keepPayment}>
                        <input type="hidden" name="id" value={b.id} />
                        <SubmitButton className="btn-outline" pendingText="Saving">Keep payment</SubmitButton>
                      </form>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <Heading title="Recent cancellations" hint="last 30 days" />
            {recent.length === 0 ? (
              <Empty>Nothing cancelled recently.</Empty>
            ) : (
              <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
                {recent.map((b) => (
                  <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                    <div className="min-w-0">
                      <p className="font-semibold">{b.service.title}, {inr(b.priceInr)}</p>
                      <p className="text-muted">
                        {b.student.name || "Student"} and {b.expert.user.name}. {whoEnded(b)}
                        {b.statusChangedAt ? `, ${fmtDateTime(b.statusChangedAt)} IST` : ""}.
                      </p>
                    </div>
                    <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold ${PAY_CLASS[b.paymentStatus] ?? PAY_CLASS.FREE}`}>
                      {PAY_LABEL[b.paymentStatus] ?? b.paymentStatus}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {/* ---------- Completed: payouts ---------- */}
      {status === "COMPLETED" && (
        <div className="space-y-10">
          <section className="space-y-3">
            <Heading title="Payouts to release" n={due.length} hint="the student confirmed the reply solved their question" />
            {due.length === 0 ? (
              <Empty>No payouts waiting.</Empty>
            ) : (
              <ul className="space-y-4">
                {due.map((b) => (
                  <li key={b.id} className="card space-y-4 p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold">{b.service.title}</p>
                        <p className="text-sm">Expert: {b.expert.user.name} <span className="text-muted">({b.expert.user.email})</span></p>
                        <p className="text-sm">Student: {b.student.name || "Student"} <span className="text-muted">({b.student.email})</span></p>
                        <p className="mt-1 text-xs text-muted">
                          Completed {b.statusChangedAt ? `${fmtDateTime(b.statusChangedAt)} IST` : ""}. Order ID: <code className="break-all text-ink">{b.cashfreeOrderId ?? "none"}</code>
                        </p>
                      </div>
                      <p className="font-display text-3xl">{inr(b.priceInr)}</p>
                    </div>
                    <form action={releasePayout} className="flex flex-wrap items-end gap-2 border-t border-dashed border-line pt-4">
                      <input type="hidden" name="id" value={b.id} />
                      <label className="min-w-[220px] flex-1 text-xs text-muted">
                        Payout reference (optional, for example the UPI or bank reference)
                        <input name="note" maxLength={200} className="input mt-1" />
                      </label>
                      <SubmitButton className="btn-primary" pendingText="Saving">Mark payout released</SubmitButton>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <Heading title="Recently paid out" hint="last 20" />
            {released.length === 0 ? (
              <Empty>Nothing released yet.</Empty>
            ) : (
              <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
                {released.map((b) => (
                  <li key={b.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
                    <div className="min-w-0">
                      <p className="font-semibold">{b.service.title}, {inr(b.priceInr)}</p>
                      <p className="text-muted">{b.expert.user.name}. {payoutLine(b)}.</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {/* ---------- Reports ---------- */}
      {status === "REPORTS" && (
        <div className="space-y-10">
          <section className="space-y-3">
            <Heading title="Open reports" n={reports.length} />
            {reports.length === 0 ? (
              <Empty>No open reports.</Empty>
            ) : (
              <ul className="space-y-4">
                {reports.map((r) => (
                  <li key={r.id} className="card space-y-3 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${r.kind === "PERSON" ? "bg-danger-soft text-danger" : "bg-warn-soft text-warn"}`}>
                        {r.kind === "PERSON" ? "About a person" : "Problem"}
                      </span>
                      <span className="font-semibold">{catLabel(r)}</span>
                      <span className="text-xs text-muted">{fmtDateTime(r.createdAt)} IST</span>
                    </div>

                    <p className="whitespace-pre-line break-words rounded-xl bg-surface-2 p-3 text-sm">{r.message}</p>

                    <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
                      <div>
                        <dt className="text-xs text-muted">Reported by</dt>
                        <dd>{who(r.reporter)}</dd>
                      </div>
                      {r.target && (
                        <div>
                          <dt className="text-xs text-muted">Reported person</dt>
                          <dd>
                            {who(r.target)}
                            {r.target.expertProfile && (
                              <Link href={`/experts/${r.target.expertProfile.slug}`} className="ml-2 text-brand hover:underline">Open profile</Link>
                            )}
                          </dd>
                        </div>
                      )}
                    </dl>

                    {r.booking && (
                      <p className="text-xs text-muted">
                        Linked request: {r.booking.service.title}, {inr(r.booking.priceInr)}, request {r.booking.status.toLowerCase()}, payment {(PAY_LABEL[r.booking.paymentStatus] ?? r.booking.paymentStatus).toLowerCase()}. Order ID: <code className="break-all text-ink">{r.booking.cashfreeOrderId ?? "none"}</code>
                      </p>
                    )}

                    <form action={resolveReport} className="flex flex-wrap items-end gap-2 border-t border-dashed border-line pt-4">
                      <input type="hidden" name="id" value={r.id} />
                      <label className="min-w-[220px] flex-1 text-xs text-muted">
                        Note to the reporter (optional)
                        <input name="note" maxLength={500} placeholder="What you did about it" className="input mt-1" />
                      </label>
                      <SubmitButton className="btn-primary" pendingText="Saving">Mark resolved</SubmitButton>
                    </form>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className="space-y-3">
            <Heading title="Recently resolved" hint="last 15" />
            {resolvedReports.length === 0 ? (
              <Empty>Nothing resolved yet.</Empty>
            ) : (
              <ul className="divide-y divide-line rounded-2xl border border-line bg-surface">
                {resolvedReports.map((r) => (
                  <li key={r.id} className="p-4 text-sm">
                    <p className="font-semibold">{catLabel(r)}</p>
                    <p className="text-muted">
                      {who(r.reporter)}{r.target ? `, about ${r.target.name || "someone"}${r.target.username ? ` @${r.target.username}` : ""}` : ""}
                      {r.resolvedAt ? `. Resolved ${fmtDateTime(r.resolvedAt)} IST` : ""}{r.adminNote ? `. Note: ${r.adminNote}` : ""}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      )}

      {/* ---------- Transactions ---------- */}
      {status === "TRANSACTIONS" && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {[
              ["Paid", total("PAID")],
              ["Refunded", total("REFUNDED")],
              ["Refund failed", total("REFUND_FAILED")],
            ].map(([label, t]) => (
              <div key={label} className="card p-4">
                <p className="font-display text-2xl">{inr(t?._sum.priceInr ?? 0)}</p>
                <p className="text-sm text-muted">{label} ({t?._count._all ?? 0})</p>
              </div>
            ))}
            <div className="card p-4">
              <p className="font-display text-2xl">{payoutsCount}</p>
              <p className="text-sm text-muted">Payouts due</p>
            </div>
          </div>

          <form className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="status" value="TRANSACTIONS" />
            <label className="min-w-[240px] flex-1 text-xs text-muted">
              Search by order ID, booking ID, student, expert or service
              <input name="q" defaultValue={q} maxLength={80} className="input mt-1" />
            </label>
            <label className="text-xs text-muted">
              Payment status
              <select name="pay" defaultValue={pay} className="input mt-1">
                <option value="">All</option>
                {PAY_STATES.map((s) => <option key={s} value={s}>{PAY_LABEL[s]}</option>)}
              </select>
            </label>
            <button className="btn-primary">Search</button>
            {(q || pay) && <Link href="/admin?status=TRANSACTIONS" className="btn-outline">Clear</Link>}
          </form>

          {txns.length === 0 ? (
            <Empty>No transactions match.</Empty>
          ) : (
            <ul className="space-y-3">
              {txns.map((b) => (
                <li key={b.id} className="card p-4 sm:p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">
                        {b.student.name || "Student"} <span className="font-normal text-muted">({b.student.email})</span>
                      </p>
                      <p className="text-sm text-muted">to {b.expert.user.name} for {b.service.title}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-display text-xl">{inr(b.priceInr)}</p>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${PAY_CLASS[b.paymentStatus] ?? PAY_CLASS.FREE}`}>
                        {PAY_LABEL[b.paymentStatus] ?? b.paymentStatus}
                      </span>
                    </div>
                  </div>
                  <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-xs text-muted sm:grid-cols-2">
                    <div>Order ID: <code className="break-all text-ink">{b.cashfreeOrderId ?? "none"}</code></div>
                    <div>Booking ID: <code className="break-all text-ink">{b.id}</code></div>
                    <div>Paid: {fmtDateTime(b.paidAt ?? b.createdAt)} IST</div>
                    <div>Request: {b.status.toLowerCase()}{b.cancelledBy ? ` (${b.cancelledBy.toLowerCase()})` : ""}</div>
                    <div>Payout: {payoutLine(b)}</div>
                    <div>Expert: <Link href={`/experts/${b.expert.slug}`} className="text-brand hover:underline">{b.expert.user.email}</Link></div>
                  </dl>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted">Amounts are the service price. GST, gateway fees and the exact amount charged are in the Cashfree dashboard. Blue tick payments are also there. Showing up to 100 newest.</p>
        </div>
      )}

      {/* ---------- Experts ---------- */}
      {EXPERT_WHERE[status] &&
        (experts.length === 0 ? (
          <Empty>Nothing in this list.</Empty>
        ) : (
          <ul className="space-y-4">
            {experts.map((e) => (
              <li key={e.id} className="card p-5 sm:p-6">
                <div className="flex flex-col gap-4 sm:flex-row">
                  <Avatar name={e.user.name} src={e.user.avatarUrl} size={56} />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link href={`/experts/${e.slug}`} className="font-display text-xl font-bold hover:underline">{e.user.name}</Link>
                      <StatusBadge status={e.status === "PENDING" || e.needsReview ? "REVIEW" : e.status} />
                    </div>
                    <p className="text-sm text-muted">{e.user.email}</p>

                    {e.unverifiedFields.length > 0 && (
                      <p className="mt-3 rounded-xl bg-warn-soft p-3 text-sm text-warn">
                        Changed since the last check: {e.unverifiedFields.map((f) => FIELD_LABELS[f]).join(", ")}. The old verification badges were removed. Re-check, then turn them back on and press "Mark reviewed".
                      </p>
                    )}

                    <p className="mt-2 text-sm">{e.jobTitle} at {e.company}, {e.experienceYears} yrs</p>
                    <p className="text-sm text-muted">{e.college}, {e.branch}, class of {e.graduationYear}</p>
                    <p className="mt-2 whitespace-pre-line break-words text-sm">{e.bio}</p>
                    <div className="mt-2 flex flex-wrap gap-3 text-sm">
                      <a href={e.linkedinUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline">LinkedIn</a>
                      {e.githubUrl && <a href={e.githubUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline">GitHub</a>}
                      <span className="text-muted">{e._count.services} services, {e._count.bookings} bookings</span>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2 border-t border-line pt-4">
                  {["educationVerified", "employmentVerified"].map((field) => (
                    <form key={field} action={toggleVerification}>
                      <input type="hidden" name="id" value={e.id} />
                      <input type="hidden" name="field" value={field} />
                      <SubmitButton className={e[field] ? "btn-primary" : "btn-outline"} pendingText="Saving">
                        {e[field] ? "✓ " : ""}{field === "educationVerified" ? "Education verified" : "Employment verified"}
                      </SubmitButton>
                    </form>
                  ))}
                  <div className="ml-auto flex flex-wrap gap-2">
                    {e.status === "ACTIVE" && e.needsReview && (
                      <form action={markReviewed}>
                        <input type="hidden" name="id" value={e.id} />
                        <SubmitButton className="btn-primary" pendingText="Saving">Mark reviewed</SubmitButton>
                      </form>
                    )}
                    <form action={setExpertStatus} className="flex gap-2">
                      <input type="hidden" name="id" value={e.id} />
                      {e.status !== "ACTIVE" && <SubmitButton name="status" value="ACTIVE" className="btn-primary" pendingText="Approving">Approve</SubmitButton>}
                      {e.status !== "SUSPENDED" && <SubmitButton name="status" value="SUSPENDED" className="btn-outline" pendingText="Saving">Suspend</SubmitButton>}
                    </form>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ))}
    </div>
  );
}
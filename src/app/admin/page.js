import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/user";
import Avatar from "@/components/Avatar";
import SubmitButton from "@/components/SubmitButton";
import StatusBadge from "@/components/StatusBadge";
import { REVIEW_WHERE, REPLY_OPEN, FIELD_LABELS } from "@/lib/review";
import { fmtDateTime } from "@/lib/constants";
import { setExpertStatus, toggleVerification, markReviewed, approveReply, rejectReply } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin | buncho" };

const EMAIL_DOMAIN = process.env.EMAIL_DOMAIN || "buncho.live";
const TABS = [["PENDING", "To review"], ["REPLIES", "Replies"], ["ACTIVE", "Live"], ["SUSPENDED", "Suspended"]];
const WHERE = {
  PENDING: REVIEW_WHERE,
  ACTIVE: { status: "ACTIVE", needsReview: false },
  SUSPENDED: { status: "SUSPENDED" },
};

export default async function Admin({ searchParams }) {
  if (!(await isAdmin())) notFound();
  const { status: raw } = await searchParams;
  const status = TABS.some(([s]) => s === raw) ? raw : "PENDING";
  const isReplies = status === "REPLIES";

  const [experts, replies, counts, students, bookings] = await Promise.all([
    isReplies
      ? []
      : prisma.expertProfile.findMany({
          where: WHERE[status],
          orderBy: { createdAt: status === "PENDING" ? "asc" : "desc" },
          include: { user: { select: { name: true, email: true, avatarUrl: true } }, _count: { select: { services: true, bookings: true } } },
        }),
    isReplies
      ? prisma.bookingReply.findMany({
          where: REPLY_OPEN,
          orderBy: { createdAt: "asc" },
          include: {
            booking: {
              include: {
                student: { select: { name: true, email: true } },
                service: { select: { title: true } },
                expert: { select: { slug: true, user: { select: { name: true } } } },
              },
            },
          },
        })
      : [],
    Promise.all(
      TABS.map(([s]) =>
        s === "REPLIES" ? prisma.bookingReply.count({ where: REPLY_OPEN }) : prisma.expertProfile.count({ where: WHERE[s] })
      )
    ),
    prisma.user.count({ where: { role: "STUDENT" } }),
    prisma.booking.count(),
  ]);
  const count = (s) => counts[TABS.findIndex(([t]) => t === s)];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Admin</h1>
        <p className="mt-1 text-muted">Check each expert's LinkedIn, education and employment before approving, and read every reply before a student gets it. {students} students, {bookings} bookings so far.</p>
      </div>

      <div className="no-scrollbar flex w-full max-w-full overflow-x-auto rounded-full border border-line bg-surface p-1 text-sm font-medium sm:w-fit">
        {TABS.map(([s, label]) => (
          <Link key={s} href={`/admin?status=${s}`} className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 sm:px-4 ${status === s ? "bg-brand text-on-brand" : "text-muted hover:text-ink"}`}>
            {label} ({count(s)})
          </Link>
        ))}
      </div>

      {isReplies ? (
        replies.length === 0 ? (
          <div className="card border-dashed p-10 text-center text-muted">No replies waiting.</div>
        ) : (
          <ul className="space-y-4">
            {replies.map((r) => (
              <li key={r.id} className="card space-y-4 p-5 sm:p-6">
                <div>
                  <p className="font-semibold">
                    {r.booking.expert.user.name} to {r.booking.student.name || "Student"}{" "}
                    <span className="font-normal text-muted">({r.booking.student.email})</span>
                  </p>
                  <p className="text-sm text-muted">{r.booking.service.title}, {fmtDateTime(r.booking.startsAt)} IST</p>
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
                    <p className="mt-1 whitespace-pre-line rounded-xl bg-surface-2 p-3 text-sm">{r.booking.note}</p>
                  </div>
                )}

                <form action={approveReply} className="space-y-3">
                  <input type="hidden" name="id" value={r.id} />
                  <label className="block text-sm font-medium">
                    Reply (you can edit it before it is sent)
                    <textarea name="body" required rows={8} maxLength={4000} defaultValue={r.body} className="input mt-1.5" />
                  </label>
                  <p className="text-xs text-muted">
                    Goes to {r.booking.student.email} from {r.booking.expert.slug}@{EMAIL_DOMAIN}.
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
        )
      ) : experts.length === 0 ? (
        <div className="card border-dashed p-10 text-center text-muted">Nothing in this list.</div>
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
      )}
    </div>
  );
}
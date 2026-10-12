import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, isAdmin } from "@/lib/user";
import { inr, fmtDateTime } from "@/lib/constants";
import { budgetLabel, days } from "@/lib/projects";
import SubmitButton from "@/components/SubmitButton";
import DeleteButton from "@/components/admin/feed/DeleteButton";
import { ProjectStatusBadge, ProposalStatusBadge } from "@/components/projects/ProjectStatusBadge";
import { deleteThreadMessage, clearThread, reopenProposal, reopenProject } from "../actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Project conversations | buncho" };

const handle = (p) => (p?.username ? `@${p.username}` : "");
const REOPENABLE = ["COMPLETED", "CANCELLED", "DECLINED", "WITHDRAWN"];

function ReopenForm({ action, field, id, label, hint }) {
  return (
    <form action={action} className="space-y-2 rounded-xl border border-line bg-surface p-4">
      <input type="hidden" name={field} value={id} />
      <p className="text-sm text-muted">{hint}</p>
      <div className="flex flex-wrap gap-2">
        <input name="note" maxLength={300} placeholder="Reason (both people are told)" className="input min-w-0 flex-1" aria-label="Reason" />
        <SubmitButton className="btn-primary !py-2" pendingText="Reopening">{label}</SubmitButton>
      </div>
    </form>
  );
}

const reopenHint = (p) =>
  p.paymentStatus === "PAID"
    ? `Puts this back to "Paid, in progress". The expert delivers again and the student confirms again.${p.payoutReleasedAt ? " The payout was already released, so it won't show as due again." : ""}`
    : "Puts this back to negotiating. Any agreed terms are cleared, and the student pays again after a new agreement.";

export default async function AdminProjectDetail({ params }) {
  const { id } = await params;
  await requireUser(`/admin/projects/${id}`);
  if (!(await isAdmin())) notFound();

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      student: { select: { name: true, username: true } },
      proposals: {
        orderBy: { createdAt: "asc" },
        include: {
          expert: { select: { userId: true, user: { select: { name: true, username: true } } } },
          messages: {
            orderBy: { createdAt: "asc" },
            include: { author: { select: { name: true, username: true } } },
          },
        },
      },
    },
  });
  if (!project) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin/projects?tab=all" className="text-sm font-medium text-muted hover:text-ink">Back to all projects</Link>

      <header className="card space-y-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="font-display text-2xl sm:text-3xl">{project.title}</h1>
            <p className="mt-1 text-sm text-muted">
              Student: {project.student.name || "A student"} {handle(project.student)} · Budget {budgetLabel(project)} · {days(project.deadlineDays)}
            </p>
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>
        <p className="whitespace-pre-line break-words text-sm">{project.description}</p>
        {project.status === "CLOSED" && (
          <ReopenForm
            action={reopenProject}
            field="id"
            id={project.id}
            label="Reopen project"
            hint="The project goes back to Open, so experts can send proposals again. To continue a past conversation, reopen it below."
          />
        )}
      </header>

      <div role="note" className="flex gap-2.5 rounded-xl bg-warn-soft p-3.5 text-xs font-medium leading-relaxed text-warn">
        <span aria-hidden="true">⚠️</span>
        <p>Messages reach the other person as soon as they are sent. Deleting a message removes it for everyone straight away and can't be undone. Messages with a "Possible contact info" chip were flagged automatically.</p>
      </div>

      {project.proposals.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-10 text-center text-muted">No conversations on this project yet.</p>
      ) : (
        project.proposals.map((p) => {
          const expertPerson = p.expert.user;
          const canReopen = REOPENABLE.includes(p.status) && p.paymentStatus !== "REFUND_FAILED";
          return (
            <section key={p.id} className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="font-display text-xl">
                    {expertPerson.name || "Expert"} <span className="text-base font-normal text-muted">{handle(expertPerson)}</span>
                  </h2>
                  <p className="text-xs text-muted">
                    {p.agreedPriceInr ? `Agreed ${inr(p.agreedPriceInr)} in ${days(p.agreedDays)} · ` : ""}
                    {p.messages.length} {p.messages.length === 1 ? "message" : "messages"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ProposalStatusBadge status={p.status} />
                  {p.messages.length > 0 && (
                    <form action={clearThread}>
                      <input type="hidden" name="proposalId" value={p.id} />
                      <DeleteButton label="Clear chat" message="Delete every message in this conversation? This can't be undone. Payment and agreed terms are not changed." />
                    </form>
                  )}
                </div>
              </div>

              <div className="overflow-hidden rounded-2xl border border-line bg-surface-2">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-surface px-4 py-3 text-sm">
                  <span><b>{project.student.name || "Student"}</b> <span className="text-muted">{handle(project.student)}</span> <span className="chip ml-1">Student</span></span>
                  <span><b>{expertPerson.name || "Expert"}</b> <span className="text-muted">{handle(expertPerson)}</span> <span className="chip ml-1">Expert</span></span>
                </div>

                {/* flex-col-reverse keeps the view pinned to the newest message */}
                <ul className="flex max-h-[34rem] min-h-[10rem] flex-col-reverse gap-3 overflow-y-auto p-4">
                  {p.messages.length === 0 && <li className="m-auto text-sm text-muted">No messages.</li>}
                  {[...p.messages].reverse().map((m) => {
                    const fromStudent = m.authorId === project.studentId;
                    return (
                      <li key={m.id} className={`flex flex-col ${fromStudent ? "items-end" : "items-start"}`}>
                        <div
                          className={`max-w-[88%] rounded-2xl px-3.5 py-2 text-sm shadow-sm sm:max-w-[78%] ${
                            fromStudent ? "rounded-br-sm bg-brand text-on-brand" : "rounded-bl-sm border border-line bg-surface"
                          }`}
                        >
                          <p className={`text-xs font-semibold ${fromStudent ? "opacity-90" : "text-brand"}`}>
                            {m.author.name || "Someone"}
                            {m.author.username && <span className="ml-1 font-normal opacity-75">@{m.author.username}</span>}
                            <span className="ml-1 font-normal opacity-75">· {fromStudent ? "Student" : "Expert"}</span>
                          </p>

                          {m.kind === "DELIVERY" && <p className="mt-1 text-xs font-semibold uppercase tracking-wide opacity-80">Delivery</p>}
                          {m.kind === "OFFER" && (
                            <p className="mt-1 font-display text-xl">
                              {inr(m.priceInr)} <span className="text-xs font-normal opacity-80">in {days(m.deliveryDays)}</span>
                            </p>
                          )}

                          <p className="mt-1 whitespace-pre-line break-words leading-relaxed">{m.body}</p>
                          <p className="mt-1 text-right text-[11px] opacity-70">{fmtDateTime(m.createdAt)}</p>
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-2">
                          {m.flags.length > 0 && (
                            <span className="rounded-full bg-warn-soft px-2.5 py-0.5 text-[11px] font-semibold text-warn">Possible contact info: {m.flags.join(", ")}</span>
                          )}
                          <form action={deleteThreadMessage}>
                            <input type="hidden" name="id" value={m.id} />
                            <DeleteButton label="Delete" message="Delete this message now? This can't be undone." />
                          </form>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {canReopen && (
                <ReopenForm
                  action={reopenProposal}
                  field="proposalId"
                  id={p.id}
                  label="Reopen conversation"
                  hint={reopenHint(p)}
                />
              )}
              {REOPENABLE.includes(p.status) && p.paymentStatus === "REFUND_FAILED" && (
                <p className="rounded-xl bg-danger-soft p-3 text-sm text-danger">The refund for this payment failed. Resolve the refund before reopening.</p>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
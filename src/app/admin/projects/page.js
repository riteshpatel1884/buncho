import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, isAdmin } from "@/lib/user";
import { inr } from "@/lib/constants";
import { timeAgo } from "@/lib/feed/feed";
import { budgetLabel, days, PROJECT_REVIEW_OPEN, PROJECT_MESSAGE_OPEN, PROJECT_PAYOUT_DUE } from "@/lib/projects";
import SubmitButton from "@/components/SubmitButton";
import { ProjectStatusBadge } from "@/components/projects/ProjectStatusBadge";
import { approveProject, rejectProject, releaseProjectPayout, refundProject } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin projects | buncho" };

const TABS = [["all", "All projects"], ["projects", "Awaiting approval"], ["payouts", "Payouts"], ["paid", "Paid projects"]];
const PAID = { paymentStatus: { in: ["PAID", "REFUND_FAILED"] }, status: { in: ["IN_PROGRESS", "DELIVERED"] } };

const Flags = ({ flags }) => flags?.length > 0 && <p className="mt-2 rounded-lg bg-warn-soft px-3 py-2 text-xs font-medium text-warn">Possible contact info: {flags.join(", ")}</p>;

function Decision({ id, approve, reject, approveLabel = "Approve" }) {
  return (
    <div className="mt-4 space-y-3 border-t border-line pt-3">
      <form action={approve} className="space-y-2">
        <input type="hidden" name="id" value={id} />
        <SubmitButton className="btn-primary !py-2" pendingText="Approving">{approveLabel}</SubmitButton>
      </form>
      <form action={reject} className="flex flex-wrap gap-2">
        <input type="hidden" name="id" value={id} />
        <input name="note" maxLength={300} placeholder="Reason (the person is told)" className="input min-w-0 flex-1" aria-label="Reason" />
        <SubmitButton className="btn-outline !py-2" pendingText="Rejecting">Reject</SubmitButton>
      </form>
    </div>
  );
}

export default async function AdminProjects({ searchParams }) {
  await requireUser("/admin/projects");
  if (!(await isAdmin())) notFound();
  const sp = await searchParams;
  const tab = TABS.some(([k]) => k === sp.tab) ? sp.tab : "all";

  const [c1, c2, c3, c4, waiting] = await Promise.all([
    prisma.project.count({ where: PROJECT_REVIEW_OPEN }),
    prisma.project.count(),
    prisma.projectProposal.count({ where: PROJECT_PAYOUT_DUE }),
    prisma.projectProposal.count({ where: PAID }),
    prisma.projectMessage.count({ where: PROJECT_MESSAGE_OPEN }),
  ]);
  const counts = { projects: c1, all: c2, payouts: c3, paid: c4 };

  let rows = [];
  if (tab === "projects") {
    rows = await prisma.project.findMany({ where: PROJECT_REVIEW_OPEN, orderBy: { createdAt: "asc" }, take: 50, include: { student: { select: { name: true } } } });
  }
  if (tab === "all") {
    rows = await prisma.project.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        student: { select: { name: true, username: true } },
        proposals: { select: { id: true, messages: { where: PROJECT_MESSAGE_OPEN, select: { id: true } } } },
      },
    });
  }
  if (tab === "payouts" || tab === "paid") {
    rows = await prisma.projectProposal.findMany({
      where: tab === "payouts" ? PROJECT_PAYOUT_DUE : PAID, orderBy: { paidAt: "asc" }, take: 50,
      include: { project: { select: { title: true, student: { select: { name: true } } } }, expert: { select: { user: { select: { name: true } } } } },
    });
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin" className="text-sm font-medium text-muted hover:text-ink">Back to admin</Link>
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Projects</h1>
        <p className="mt-1 text-muted">Open a project to read its conversations, approve or delete messages, and reopen it if needed.</p>
      </div>
      <div className="flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map(([k, label]) => (
          <Link key={k} href={`/admin/projects?tab=${k}`} className={`-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium ${tab === k ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink"}`}>
            {label} <span className="ml-1 rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">{counts[k]}</span>
          </Link>
        ))}
      </div>

      {tab === "all" && waiting > 0 && (
        <p role="status" className="rounded-xl bg-warn-soft p-4 text-sm font-medium text-warn">
          {waiting} {waiting === 1 ? "message is" : "messages are"} waiting for your review. Open a project marked "waiting" to approve or reject them.
        </p>
      )}

      {rows.length === 0 ? (
        <p className="rounded-xl border border-dashed border-line p-10 text-center text-muted">
          {tab === "all" ? "No projects yet." : "Nothing waiting here."}
        </p>
      ) : (
        <ul className="space-y-4">
          {tab === "projects" && rows.map((p) => (
            <li key={p.id} className="card p-5">
              <p className="font-semibold">{p.title}</p>
              <p className="text-xs text-muted">{p.student.name || "Student"} · {budgetLabel(p)} · {days(p.deadlineDays)} · {timeAgo(p.createdAt.toISOString())}</p>
              <p className="mt-3 whitespace-pre-line break-words text-sm">{p.description}</p>
              <ul className="mt-2 list-disc pl-5 text-sm">{p.deliverables.map((d) => <li key={d}>{d}</li>)}</ul>
              <Flags flags={p.noteFlags} />
              <Decision id={p.id} approve={approveProject} reject={rejectProject} approveLabel="Publish to experts" />
            </li>
          ))}

          {tab === "all" && rows.map((p) => {
            const pending = p.proposals.reduce((n, x) => n + x.messages.length, 0);
            return (
              <li key={p.id}>
                <Link href={`/admin/projects/${p.id}`} className="card card-hover flex flex-wrap items-center justify-between gap-3 p-5">
                  <div className="min-w-0">
                    <p className="truncate font-semibold">{p.title}</p>
                    <p className="text-sm text-muted">
                      {p.student.name || "Student"}{p.student.username ? ` @${p.student.username}` : ""} · {budgetLabel(p)} · {p.proposals.length} {p.proposals.length === 1 ? "conversation" : "conversations"} · {timeAgo(p.createdAt.toISOString())}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {pending > 0 && <span className="rounded-full bg-warn-soft px-2.5 py-0.5 text-xs font-semibold text-warn">{pending} waiting</span>}
                    <ProjectStatusBadge status={p.status} />
                  </div>
                </Link>
              </li>
            );
          })}

          {tab === "payouts" && rows.map((p) => (
            <li key={p.id} className="card p-5">
              <p className="font-semibold">{p.project.title}</p>
              <p className="text-sm text-muted">Pay <b className="text-ink">{p.expert.user.name}</b> {inr(p.payoutInr)} (student paid {inr(p.agreedPriceInr)}, Buncho fee {inr(p.feeInr)})</p>
              <Link href={`/admin/projects/${p.projectId}`} className="mt-1 inline-block text-xs font-medium text-brand hover:underline">Open conversation</Link>
              <form action={releaseProjectPayout} className="mt-3 flex flex-wrap gap-2">
                <input type="hidden" name="id" value={p.id} />
                <input name="note" maxLength={200} placeholder="Note, for example the UPI reference" className="input min-w-0 flex-1" aria-label="Note" />
                <SubmitButton className="btn-primary !py-2" pendingText="Saving">Mark as paid out</SubmitButton>
              </form>
            </li>
          ))}

          {tab === "paid" && rows.map((p) => (
            <li key={p.id} className="card flex flex-wrap items-center justify-between gap-3 p-5">
              <div className="min-w-0">
                <p className="font-semibold">{p.project.title}</p>
                <p className="text-sm text-muted">{p.project.student.name} paid {inr(p.agreedPriceInr)} to {p.expert.user.name} · {p.status.toLowerCase().replace("_", " ")}{p.paymentStatus === "REFUND_FAILED" ? " · refund failed" : ""}</p>
                <Link href={`/admin/projects/${p.projectId}`} className="text-xs font-medium text-brand hover:underline">Open conversation</Link>
              </div>
              <form action={refundProject}>
                <input type="hidden" name="id" value={p.id} />
                <SubmitButton className="btn-outline !py-2" pendingText="Refunding">Refund in full</SubmitButton>
              </form>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
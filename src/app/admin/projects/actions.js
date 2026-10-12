"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/user";
import { refundProposal } from "@/lib/projectPayment";
import { PROJECT_PAYOUT_DUE } from "@/lib/projects";
import { emailProjectApproved, emailProjectRejected, emailProjectCancelled, emailProjectReopened } from "@/lib/email";

const get = (fd, k) => String(fd.get(k) || "").trim();
const refresh = () => {
  revalidatePath("/admin/projects");
  revalidatePath("/admin/projects/[id]", "page");
  revalidatePath("/projects");
};

// ---------- Projects ----------
export async function approveProject(formData) {
  if (!(await isAdmin())) return;
  const id = get(formData, "id");
  const done = await prisma.project.updateMany({ where: { id, status: "PENDING_REVIEW" }, data: { status: "OPEN" } });
  if (done.count === 0) return;
  const p = await prisma.project.findUnique({ where: { id }, include: { student: { select: { email: true } } } });
  await emailProjectApproved({ to: p.student.email, title: p.title, path: `/projects/${p.id}` });
  refresh();
}

export async function rejectProject(formData) {
  if (!(await isAdmin())) return;
  const id = get(formData, "id");
  const note = get(formData, "note").slice(0, 300) || "Please remove phone numbers, emails, links and social handles, then post it again.";
  const p = await prisma.project.findFirst({ where: { id, status: "PENDING_REVIEW" }, include: { student: { select: { email: true } } } });
  if (!p) return;
  const done = await prisma.project.updateMany({ where: { id, status: "PENDING_REVIEW" }, data: { status: "REJECTED", reviewNote: note } });
  if (done.count === 0) return;
  await emailProjectRejected({ to: p.student.email, title: p.title, note });
  refresh();
}

// ---------- Conversations ----------
// Deletes one message right away.
export async function deleteThreadMessage(formData) {
  if (!(await isAdmin())) return;
  const id = get(formData, "id");
  if (!id) return;
  const m = await prisma.projectMessage.findUnique({ where: { id }, select: { proposal: { select: { id: true, projectId: true } } } });
  await prisma.projectMessage.deleteMany({ where: { id } });
  if (m) revalidatePath(`/projects/${m.proposal.projectId}/p/${m.proposal.id}`);
  refresh();
}

// Deletes every message in one conversation. The proposal, agreed terms and payment are left alone.
export async function clearThread(formData) {
  if (!(await isAdmin())) return;
  const proposalId = get(formData, "proposalId");
  if (!proposalId) return;
  const p = await prisma.projectProposal.findUnique({ where: { id: proposalId }, select: { id: true, projectId: true } });
  await prisma.projectMessage.deleteMany({ where: { proposalId } });
  if (p) revalidatePath(`/projects/${p.projectId}/p/${p.id}`);
  refresh();
}

// ---------- Reopen ----------
const REOPENABLE = ["COMPLETED", "CANCELLED", "DECLINED", "WITHDRAWN"];

// Reopens one conversation. Paid work goes back to "in progress" so the expert can deliver again
// and the student can confirm again. Unpaid or refunded work goes back to negotiating.
export async function reopenProposal(formData) {
  if (!(await isAdmin())) return;
  const id = get(formData, "proposalId");
  const note = get(formData, "note").slice(0, 300);
  const p = await prisma.projectProposal.findUnique({
    where: { id },
    include: {
      project: { include: { student: { select: { email: true } } } },
      expert: { select: { user: { select: { email: true } } } },
    },
  });
  if (!p || !REOPENABLE.includes(p.status) || p.paymentStatus === "REFUND_FAILED") return;

  // Only one conversation per project can be agreed or paid at a time.
  const busy = await prisma.projectProposal.count({
    where: { projectId: p.projectId, id: { not: p.id }, status: { in: ["AGREED", "IN_PROGRESS", "DELIVERED", "COMPLETED"] } },
  });
  if (busy > 0) return;

  const paid = p.paymentStatus === "PAID";
  const data = paid
    ? { status: "IN_PROGRESS", completedAt: null, cancelledBy: null }
    : {
        status: "ACTIVE", cancelledBy: null, completedAt: null, paymentStatus: "UNPAID",
        agreedPriceInr: null, agreedScope: null, agreedDays: null, agreedAt: null, cashfreeOrderId: null, paidAt: null,
      };

  const changed = await prisma.$transaction(async (tx) => {
    const done = await tx.projectProposal.updateMany({ where: { id: p.id, status: p.status }, data });
    if (done.count === 0) return false;
    await tx.project.update({ where: { id: p.projectId }, data: { status: paid ? "IN_PROGRESS" : "OPEN" } });
    return true;
  });
  if (!changed) return;

  const path = `/projects/${p.projectId}/p/${p.id}`;
  await emailProjectReopened({ to: p.project.student.email, title: p.project.title, note, path });
  await emailProjectReopened({ to: p.expert.user.email, title: p.project.title, note, path });
  revalidatePath(path);
  revalidatePath(`/projects/${p.projectId}`);
  refresh();
}

// Reopens a project the student closed, so experts can send proposals again.
export async function reopenProject(formData) {
  if (!(await isAdmin())) return;
  const id = get(formData, "id");
  const note = get(formData, "note").slice(0, 300);
  const p = await prisma.project.findFirst({ where: { id, status: "CLOSED" }, include: { student: { select: { email: true } } } });
  if (!p) return;
  const done = await prisma.project.updateMany({ where: { id, status: "CLOSED" }, data: { status: "OPEN" } });
  if (done.count === 0) return;
  await emailProjectReopened({ to: p.student.email, title: p.title, note, path: `/projects/${p.id}` });
  revalidatePath(`/projects/${id}`);
  refresh();
}

// ---------- Money ----------
export async function releaseProjectPayout(formData) {
  if (!(await isAdmin())) return;
  const note = get(formData, "note").slice(0, 200) || null;
  await prisma.projectProposal.updateMany({ where: { id: get(formData, "id"), ...PROJECT_PAYOUT_DUE }, data: { payoutReleasedAt: new Date(), payoutNote: note } });
  refresh();
}

// For disputes: refund the student in full and close the project.
export async function refundProject(formData) {
  if (!(await isAdmin())) return;
  const id = get(formData, "id");
  const p = await prisma.projectProposal.findFirst({
    where: { id, paymentStatus: { in: ["PAID", "REFUND_FAILED"] }, status: { in: ["IN_PROGRESS", "DELIVERED"] } },
    include: { project: { include: { student: { select: { email: true } } } }, expert: { select: { user: { select: { email: true } } } } },
  });
  if (!p || !p.cashfreeOrderId) return;

  await refundProposal({ id: p.id, paymentStatus: "PAID", cashfreeOrderId: p.cashfreeOrderId });
  const after = await prisma.projectProposal.findUnique({ where: { id }, select: { paymentStatus: true } });
  if (after?.paymentStatus === "REFUNDED") {
    await prisma.$transaction([
      prisma.projectProposal.update({ where: { id }, data: { status: "CANCELLED", cancelledBy: "ADMIN" } }),
      prisma.project.update({ where: { id: p.projectId }, data: { status: "CLOSED" } }),
    ]);
    const path = `/projects/${p.projectId}/p/${p.id}`;
    await emailProjectCancelled({ to: p.project.student.email, byName: "Buncho", title: p.project.title, refunded: true, path });
    await emailProjectCancelled({ to: p.expert.user.email, byName: "Buncho", title: p.project.title, path });
  }
  refresh();
}
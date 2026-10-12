"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { SERVICE_TYPES } from "@/lib/constants";
import { findContactInfo } from "@/lib/contactCheck";
import { createProposalCheckout } from "@/lib/projectPayment";
import { emailAdmin, emailProjectAgreed, emailProjectCancelled, emailProjectMessage } from "@/lib/email";
import {
  BUDGET_MODES, PRICE_MIN, PRICE_MAX, DEADLINES, MAX_DELIVERABLES, MAX_TEXT,
  ACTIVE_PROJECT_LIMIT, THREAD_OPEN, offerError,
} from "@/lib/projects";

const get = (fd, k) => String(fd.get(k) || "").trim();
const threadPath = (p) => `/projects/${p.projectId}/p/${p.id}`;
const refresh = () => {
  revalidatePath("/projects");
  revalidatePath("/admin/projects");
};

// ---------- Student: publish a project ----------
// The project is not shown to experts until an admin has read it.
export async function createProject(_prev, formData) {
  const user = await requireUser("/projects/new");
  if (user.role !== "STUDENT") return { error: "Only student accounts can post projects." };

  const title = get(formData, "title");
  const description = get(formData, "description");
  const helpType = get(formData, "helpType");
  const deliverables = get(formData, "deliverables").split("\n").map((s) => s.trim()).filter(Boolean).slice(0, MAX_DELIVERABLES);
  const deadlineDays = Number.parseInt(get(formData, "deadlineDays"), 10);
  const budgetMode = get(formData, "budgetMode");
  let budgetMinInr = Number.parseInt(get(formData, "budgetMin"), 10);
  let budgetMaxInr = Number.parseInt(get(formData, "budgetMax"), 10);

  if (title.length < 5 || title.length > 100) return { error: "Title must be 5 to 100 characters." };
  if (description.length < 30) return { error: "Describe the project in at least 30 characters." };
  if (description.length > MAX_TEXT) return { error: `Keep the description under ${MAX_TEXT} characters.` };
  if (!Object.hasOwn(SERVICE_TYPES, helpType)) return { error: "Choose the kind of help you need." };
  if (deliverables.length === 0) return { error: "List at least one thing you want to get." };
  if (deliverables.some((d) => d.length > 100)) return { error: "Each item must be 100 characters or fewer." };
  if (!DEADLINES.includes(deadlineDays)) return { error: "Choose a deadline." };
  if (!Object.hasOwn(BUDGET_MODES, budgetMode)) return { error: "Choose a budget type." };
  if (budgetMode === "OPEN") {
    budgetMinInr = null;
    budgetMaxInr = null;
  } else {
    const ok = (n) => Number.isSafeInteger(n) && n >= PRICE_MIN && n <= PRICE_MAX;
    if (!ok(budgetMinInr) || !ok(budgetMaxInr)) return { error: `Budget must be between ₹${PRICE_MIN} and ₹${PRICE_MAX}.` };
    if (budgetMinInr > budgetMaxInr) return { error: "The minimum budget can't be above the maximum." };
  }

  const live = await prisma.project.count({ where: { studentId: user.id, status: { in: ["PENDING_REVIEW", "OPEN", "AGREED", "IN_PROGRESS"] } } });
  if (live >= ACTIVE_PROJECT_LIMIT) return { error: `You already have ${ACTIVE_PROJECT_LIMIT} live projects. Close one first.` };

  const flags = findContactInfo(`${title}\n${description}\n${deliverables.join("\n")}`);
  const project = await prisma.project.create({
    data: { studentId: user.id, title, description, helpType, deliverables, deadlineDays, budgetMode, budgetMinInr, budgetMaxInr, noteFlags: flags },
  });

  await emailAdmin({
    subject: "New project to approve",
    lines: [`${user.name || "A student"} posted "${title}".`, ...(flags.length ? [`Possible contact info: ${flags.join(", ")}.`] : [])],
    path: "/admin/projects?tab=projects",
  });
  refresh();
  redirect(`/projects/${project.id}?posted=1`);
}

export async function closeProject(formData) {
  const user = await requireUser("/projects");
  const id = get(formData, "id");
  await prisma.$transaction(async (tx) => {
    const done = await tx.project.updateMany({ where: { id, studentId: user.id, status: { in: ["PENDING_REVIEW", "OPEN"] } }, data: { status: "CLOSED" } });
    if (done.count === 0) return;
    await tx.projectProposal.updateMany({ where: { projectId: id, status: "ACTIVE" }, data: { status: "DECLINED", cancelledBy: "STUDENT" } });
  });
  refresh();
  revalidatePath(`/projects/${id}`);
}

// ---------- Expert: first proposal ----------
// intent "offer" sends a price and scope. intent "question" only asks something first.
// It reaches the student straight away.
export async function submitProposal(_prev, formData) {
  const projectId = get(formData, "projectId");
  const user = await requireUser(`/projects/${projectId}`);
  const expert = await prisma.expertProfile.findUnique({ where: { userId: user.id }, select: { id: true, status: true } });
  if (!expert || expert.status !== "ACTIVE") return { error: "Only approved experts can send proposals." };

  const project = await prisma.project.findFirst({
    where: { id: projectId, status: "OPEN" },
    include: { student: { select: { email: true } } },
  });
  if (!project) return { error: "This project is no longer open." };

  const existing = await prisma.projectProposal.findUnique({ where: { projectId_expertId: { projectId, expertId: expert.id } }, select: { id: true } });
  if (existing) redirect(`/projects/${projectId}/p/${existing.id}`);

  const intent = get(formData, "intent") === "question" ? "question" : "offer";
  const body = get(formData, "body");
  if (body.length < 20) return { error: "Write at least 20 characters." };
  if (body.length > MAX_TEXT) return { error: `Keep it under ${MAX_TEXT} characters.` };

  let priceInr = null;
  let deliveryDays = null;
  if (intent === "offer") {
    priceInr = Number.parseInt(get(formData, "price"), 10);
    deliveryDays = Number.parseInt(get(formData, "days"), 10);
    const bad = offerError(project, priceInr, deliveryDays);
    if (bad) return { error: bad };
  }

  const flags = findContactInfo(body);
  const kind = intent === "offer" ? "OFFER" : "MESSAGE";
  let proposal;
  try {
    proposal = await prisma.projectProposal.create({
      data: {
        projectId, expertId: expert.id,
        messages: { create: { authorId: user.id, kind, body, priceInr, deliveryDays, flags, reviewStatus: "APPROVED", reviewedAt: new Date() } },
      },
    });
  } catch (e) {
    if (e?.code === "P2002") return { error: "You already sent a proposal for this project." };
    throw e;
  }

  // The student is told straight away. The team is only told when contact info was found.
  await emailProjectMessage({ to: project.student.email, fromName: user.name, title: project.title, kind, priceInr, path: threadPath(proposal) });
  if (flags.length) {
    await emailAdmin({
      subject: "Flagged proposal",
      lines: [`${user.name || "An expert"} sent a proposal on "${project.title}".`, `Possible contact info: ${flags.join(", ")}.`],
      path: `/admin/projects/${project.id}`,
    });
  }
  refresh();
  redirect(threadPath(proposal));
}

// ---------- Conversation ----------
async function loadProposal(id) {
  const user = await requireUser("/projects");
  const proposal = await prisma.projectProposal.findUnique({
    where: { id: String(id) },
    include: {
      project: { include: { student: { select: { name: true, email: true } } } },
      expert: { select: { userId: true, user: { select: { name: true, email: true } } } },
    },
  });
  if (!proposal) return {};
  const isExpert = proposal.expert.userId === user.id;
  const isStudent = proposal.project.studentId === user.id;
  return isExpert || isStudent ? { user, proposal, isExpert, isStudent } : {};
}

// A message, an offer or a delivery. It reaches the other person straight away.
export async function sendThreadMessage(_prev, formData) {
  const { user, proposal, isExpert } = await loadProposal(get(formData, "proposalId"));
  if (!proposal) return { error: "Conversation not found." };

  const intent = get(formData, "intent");
  const kind = { message: "MESSAGE", offer: "OFFER", delivery: "DELIVERY" }[intent];
  if (!kind) return { error: "Choose what you want to send." };

  if (kind === "MESSAGE" && !THREAD_OPEN.includes(proposal.status)) return { error: "This conversation is closed." };
  if (kind === "OFFER" && (proposal.status !== "ACTIVE" || proposal.project.status !== "OPEN")) return { error: "Offers can only be made while you are still negotiating." };
  if (kind === "DELIVERY" && (!isExpert || !["IN_PROGRESS", "DELIVERED"].includes(proposal.status))) return { error: "You can deliver once the student has paid." };

  const body = get(formData, "body");
  if (body.length < (kind === "MESSAGE" ? 2 : 20)) return { error: kind === "MESSAGE" ? "Write a little more." : "Write at least 20 characters." };
  if (body.length > MAX_TEXT) return { error: `Keep it under ${MAX_TEXT} characters.` };

  let priceInr = null;
  let deliveryDays = null;
  if (kind === "OFFER") {
    priceInr = Number.parseInt(get(formData, "price"), 10);
    deliveryDays = Number.parseInt(get(formData, "days"), 10);
    const bad = offerError(proposal.project, priceInr, deliveryDays);
    if (bad) return { error: bad };
  }

  const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
  if ((await prisma.projectMessage.count({ where: { authorId: user.id, createdAt: { gte: hourAgo } } })) >= 30) return { error: "You're sending messages very fast. Please wait a bit." };

  const flags = findContactInfo(body);
  await prisma.projectMessage.create({
    data: { proposalId: proposal.id, authorId: user.id, kind, body, priceInr, deliveryDays, flags, reviewStatus: "APPROVED", reviewedAt: new Date() },
  });

  // A delivery moves the project to "Delivered" so the student can confirm it.
  if (kind === "DELIVERY") {
    await prisma.projectProposal.updateMany({ where: { id: proposal.id, status: { in: ["IN_PROGRESS", "DELIVERED"] } }, data: { status: "DELIVERED" } });
  }

  const to = isExpert ? proposal.project.student : proposal.expert.user;
  await emailProjectMessage({ to: to.email, fromName: user.name, title: proposal.project.title, kind, priceInr, path: threadPath(proposal) });
  if (flags.length) {
    await emailAdmin({
      subject: "Flagged message",
      lines: [`On "${proposal.project.title}".`, `Possible contact info: ${flags.join(", ")}.`],
      path: `/admin/projects/${proposal.projectId}`,
    });
  }
  refresh();
  revalidatePath(threadPath(proposal));
  return { ok: true };
}

// Accepting the latest offer from the other person. The person who made the offer
// already agreed to it by sending it, so this is the second, explicit confirmation.
export async function acceptOffer(formData) {
  const { user, proposal } = await loadProposal(get(formData, "proposalId"));
  if (!proposal || proposal.status !== "ACTIVE") return;

  const latest = await prisma.projectMessage.findFirst({
    where: { proposalId: proposal.id, kind: "OFFER" },
    orderBy: { createdAt: "desc" },
  });
  if (!latest || latest.id !== get(formData, "messageId") || latest.authorId === user.id) return;

  try {
    await prisma.$transaction(async (tx) => {
      // Only one expert per project can reach "agreed" at a time.
      const p = await tx.project.updateMany({ where: { id: proposal.projectId, status: "OPEN" }, data: { status: "AGREED" } });
      if (p.count === 0) throw new Error("skip");
      const q = await tx.projectProposal.updateMany({
        where: { id: proposal.id, status: "ACTIVE" },
        data: { status: "AGREED", agreedPriceInr: latest.priceInr, agreedScope: latest.body, agreedDays: latest.deliveryDays, agreedAt: new Date() },
      });
      if (q.count === 0) throw new Error("skip");
    });
  } catch (e) {
    if (e?.message === "skip") return;
    throw e;
  }

  const toStudent = proposal.project.studentId !== user.id;
  const other = toStudent ? proposal.project.student : proposal.expert.user;
  await emailProjectAgreed({ to: other.email, title: proposal.project.title, priceInr: latest.priceInr, toStudent, path: threadPath(proposal) });
  refresh();
  revalidatePath(threadPath(proposal));
}

// Either person can walk away before payment. The project goes back to "open" if it had been agreed.
export async function cancelProposal(formData) {
  const { user, proposal, isExpert } = await loadProposal(get(formData, "proposalId"));
  if (!proposal || !["ACTIVE", "AGREED"].includes(proposal.status) || proposal.paymentStatus !== "UNPAID") return;

  const wasAgreed = proposal.status === "AGREED";
  const next = wasAgreed ? "CANCELLED" : isExpert ? "WITHDRAWN" : "DECLINED";
  const changed = await prisma.$transaction(async (tx) => {
    const done = await tx.projectProposal.updateMany({
      where: { id: proposal.id, status: proposal.status, paymentStatus: "UNPAID" },
      data: { status: next, cancelledBy: isExpert ? "EXPERT" : "STUDENT" },
    });
    if (done.count === 0) return false;
    if (wasAgreed) await tx.project.updateMany({ where: { id: proposal.projectId, status: "AGREED" }, data: { status: "OPEN" } });
    return true;
  });
  if (!changed) return;

  const other = isExpert ? proposal.project.student : proposal.expert.user;
  const by = isExpert ? proposal.expert.user : proposal.project.student;
  await emailProjectCancelled({ to: other.email, byName: by.name, title: proposal.project.title, path: threadPath(proposal) });
  refresh();
  revalidatePath(threadPath(proposal));
}

// ---------- Payment and completion ----------
export async function startProjectPayment(formData) {
  const { user, proposal, isStudent } = await loadProposal(get(formData, "proposalId"));
  if (!proposal || !isStudent || proposal.status !== "AGREED" || proposal.paymentStatus !== "UNPAID") return;

  let url = null;
  try {
    url = await createProposalCheckout({ proposal, user });
  } catch (e) {
    console.error("[project checkout] failed:", e?.message);
  }
  redirect(url ?? `${threadPath(proposal)}?error=checkout`); // outside try/catch: redirect() throws on purpose
}

// The student confirms the delivery solved their problem. This is what lets the payout go out.
export async function confirmCompletion(formData) {
  const { proposal, isStudent } = await loadProposal(get(formData, "proposalId"));
  if (!proposal || !isStudent || proposal.status !== "DELIVERED") return;

  const done = await prisma.projectProposal.updateMany({ where: { id: proposal.id, status: "DELIVERED" }, data: { status: "COMPLETED", completedAt: new Date() } });
  if (done.count === 0) return;
  await prisma.project.update({ where: { id: proposal.projectId }, data: { status: "COMPLETED" } });

  await emailAdmin({
    subject: "Project completed: release the payout",
    lines: [`"${proposal.project.title}" by ${proposal.expert.user.name} is complete.`, `Agreed price: ₹${proposal.agreedPriceInr}.`, "The student confirmed the work."],
    path: "/admin/projects?tab=payouts",
  });
  refresh();
  revalidatePath(threadPath(proposal));
}
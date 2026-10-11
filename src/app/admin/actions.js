"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/user";
import { refundBooking } from "@/lib/bookingPayment";
import { findContactInfo } from "@/lib/contactCheck";
import { REFUND_OPEN, REQUEST_OPEN, PAYOUT_DUE } from "@/lib/review";
import { emailExpertReply, emailReplyRejected, emailNewRequest, emailRequestRejected, emailReportResolved } from "@/lib/email";

const refresh = () => {
  revalidatePath("/admin");
  revalidatePath("/experts");
  revalidatePath("/dashboard");
};

// ---------- Experts ----------
export async function setExpertStatus(formData) {
  if (!(await isAdmin())) return;
  const status = String(formData.get("status"));
  if (!["PENDING", "ACTIVE", "SUSPENDED"].includes(status)) return;
  // Approving counts as a review, so it also clears any "changed details" marks.
  const data = status === "ACTIVE" ? { status, needsReview: false, unverifiedFields: [] } : { status };
  await prisma.expertProfile.update({ where: { id: String(formData.get("id")) }, data });
  refresh();
}

// Admin has checked the changed details. Clears the "Not verified" marks and the review flag.
export async function markReviewed(formData) {
  if (!(await isAdmin())) return;
  await prisma.expertProfile.update({
    where: { id: String(formData.get("id")) },
    data: { needsReview: false, unverifiedFields: [] },
  });
  refresh();
}

// field is "educationVerified" or "employmentVerified". Verification means Buncho actually checked the claim.
export async function toggleVerification(formData) {
  if (!(await isAdmin())) return;
  const field = String(formData.get("field"));
  if (!["educationVerified", "employmentVerified"].includes(field)) return;
  const id = String(formData.get("id"));
  const expert = await prisma.expertProfile.findUnique({ where: { id }, select: { [field]: true } });
  if (!expert) return;
  await prisma.expertProfile.update({ where: { id }, data: { [field]: !expert[field] } });
  refresh();
}

// Sends the (optionally edited) reply to the student, as the expert.
// The request stays open: the student decides whether it solved their question.
export async function approveReply(formData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") || "");
  const body = String(formData.get("body") || "").trim().slice(0, 4000);
  if (!id || !body) return;

  // Claim it first so a double click can't send the email twice.
  const claimed = await prisma.bookingReply.updateMany({
    where: { id, status: { in: ["PENDING", "SEND_FAILED"] } },
    data: { status: "SENDING" },
  });
  if (claimed.count === 0) return;

  const reply = await prisma.bookingReply.findUnique({
    where: { id },
    include: {
      booking: {
        include: {
          student: { select: { name: true, email: true } },
          service: { select: { title: true } },
          expert: { select: { slug: true, user: { select: { name: true } } } },
        },
      },
    },
  });

  // The request was cancelled while the reply was waiting: nothing to send.
  if (reply.booking.status !== "CONFIRMED") {
    await prisma.bookingReply.update({
      where: { id },
      data: { status: "REJECTED", adminNote: "This request was closed before the reply was sent.", reviewedAt: new Date() },
    });
    refresh();
    return;
  }

  const ok = await emailExpertReply({
    to: reply.booking.student.email,
    expert: { name: reply.booking.expert.user.name, slug: reply.booking.expert.slug },
    title: reply.booking.service.title,
    body,
  });

  await prisma.bookingReply.update({
    where: { id },
    data: ok
      ? { status: "SENT", body, sentAt: new Date(), reviewedAt: new Date() }
      : { status: "SEND_FAILED", body },
  });
  refresh();
}

export async function rejectReply(formData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") || "");
  const note = String(formData.get("note") || "").trim().slice(0, 300) || "Please remove contact details and send it again.";

  const reply = await prisma.bookingReply.findFirst({
    where: { id, status: { in: ["PENDING", "SEND_FAILED"] } },
    include: {
      booking: {
        include: {
          service: { select: { title: true } },
          expert: { select: { user: { select: { email: true } } } },
        },
      },
    },
  });
  if (!reply) return;

  await prisma.bookingReply.update({
    where: { id },
    data: { status: "REJECTED", adminNote: note, reviewedAt: new Date() },
  });
  await emailReplyRejected({ to: reply.booking.expert.user.email, title: reply.booking.service.title, note });
  refresh();
}

// ---------- Refunds ----------
// Refund a cancelled or declined booking (also retries a failed refund).
export async function refundNow(formData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") || "");
  const booking = await prisma.booking.findFirst({ where: { id, ...REFUND_OPEN }, select: { id: true, dodoPaymentId: true } });
  if (!booking || !booking.dodoPaymentId) return;

  await refundBooking({ id: booking.id, paymentStatus: "PAID", dodoPaymentId: booking.dodoPaymentId });

  const after = await prisma.booking.findUnique({ where: { id }, select: { paymentStatus: true } });
  if (after?.paymentStatus === "REFUNDED") {
    await prisma.booking.update({ where: { id }, data: { resolvedAt: new Date() } });
  }
  refresh();
}

// Decide not to refund. The case leaves the Inbox and the student sees that the payment was kept.
export async function keepPayment(formData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") || "");
  await prisma.booking.updateMany({ where: { id, ...REFUND_OPEN }, data: { resolvedAt: new Date() } });
  refresh();
}


// ---------- Student requests ----------
// The (optionally edited) request is shown to the expert and they are emailed.
export async function approveRequest(formData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") || "");
  const note = String(formData.get("note") || "").trim().slice(0, 1000);
  if (!id || note.length < 10) return;

  const done = await prisma.booking.updateMany({
    where: { id, ...REQUEST_OPEN },
    data: { reviewStatus: "APPROVED", note, noteFlags: findContactInfo(note) },
  });
  if (done.count === 0) return;

  const b = await prisma.booking.findUnique({
    where: { id },
    include: {
      student: { select: { name: true } },
      service: { select: { title: true } },
      expert: { select: { user: { select: { email: true } } } },
    },
  });
  await emailNewRequest({ to: b.expert.user.email, studentName: b.student.name, title: b.service.title, note: b.note });
  refresh();
}

// The request is never shown to the expert. A paid request is refunded in full.
export async function rejectRequest(formData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") || "");
  const note =
    String(formData.get("note") || "").trim().slice(0, 300) ||
    "Please remove phone numbers, emails, links and social handles, then send it again.";

  const b = await prisma.booking.findFirst({
    where: { id, ...REQUEST_OPEN },
    include: { student: { select: { email: true } }, service: { select: { title: true } } },
  });
  if (!b) return;

  const done = await prisma.booking.updateMany({
    where: { id, ...REQUEST_OPEN },
    data: { status: "CANCELLED", reviewStatus: "REJECTED", reviewNote: note, cancelledBy: "ADMIN", statusChangedAt: new Date() },
  });
  if (done.count === 0) return;

  await refundBooking(b); // does nothing unless the booking was paid
  await emailRequestRejected({ to: b.student.email, title: b.service.title, note, refunded: b.paymentStatus === "PAID" });
  refresh();
}

// ---------- Payouts ----------
// Record that you paid the expert for a completed session.
export async function releasePayout(formData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") || "");
  const note = String(formData.get("note") || "").trim().slice(0, 200) || null;
  await prisma.booking.updateMany({
    where: { id, ...PAYOUT_DUE },
    data: { payoutReleasedAt: new Date(), payoutNote: note },
  });
  refresh();
}

// Marks a report as handled and lets the reporter know.
export async function resolveReport(formData) {
  if (!(await isAdmin())) return;
  const id = String(formData.get("id") || "");
  const note = String(formData.get("note") || "").trim().slice(0, 500) || null;
  if (!id) return;

  const r = await prisma.report.findFirst({
    where: { id, status: "OPEN" },
    include: { reporter: { select: { email: true } } },
  });
  if (!r) return;

  const done = await prisma.report.updateMany({
    where: { id, status: "OPEN" },
    data: { status: "RESOLVED", adminNote: note, resolvedAt: new Date() },
  });
  if (done.count === 0) return;

  // The report is already closed. A problem with the email must never break the page.
  try {
    await emailReportResolved({ to: r.reporter.email, note });
  } catch (e) {
    console.error("[report] resolved email failed:", e?.message);
  }
  refresh();
}
"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/user";
import { emailExpertReply, emailReplyRejected } from "@/lib/email";
import { refundBooking } from "@/lib/bookingPayment";
import { REFUND_OPEN } from "@/lib/review";

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
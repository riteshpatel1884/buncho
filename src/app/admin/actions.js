"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/user";
import { emailExpertReply, emailReplyRejected } from "@/lib/email";

const refresh = () => {
  revalidatePath("/admin");
  revalidatePath("/experts");
  revalidatePath("/dashboard");
};

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

// Sends the (optionally edited) reply to the student, as the expert, from <expert-slug>@EMAIL_DOMAIN.
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
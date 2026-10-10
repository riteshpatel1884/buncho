"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { SERVICE_TYPES, DURATIONS, timeToMinutes } from "@/lib/constants";
import { refundBooking } from "@/lib/bookingPayment";
import { findContactInfo } from "@/lib/contactCheck";
import { emailConfirmed, emailDeclined, emailCancelled, emailFollowUp } from "@/lib/email";
import { replyCycle, MAX_FOLLOW_UPS } from "@/lib/replyCycle";


const get = (fd, k) => String(fd.get(k) || "").trim();
const refresh = () => {
  revalidatePath("/dashboard");
  revalidatePath("/experts");
  revalidatePath("/admin");
};

// Loads a booking only if the signed-in user is the student or the expert on it.
async function myBooking(formData) {
  const user = await requireUser("/dashboard");
  const booking = await prisma.booking.findUnique({
    where: { id: get(formData, "id") },
    include: {
      expert: { select: { userId: true, user: { select: { name: true, email: true } } } },
      student: { select: { name: true, email: true } },
      service: { select: { title: true } },
    },
  });
  if (!booking) return {};
  const isExpert = booking.expert.userId === user.id;
  const isStudent = booking.studentId === user.id;
  return isExpert || isStudent ? { booking, isExpert, isStudent } : {};
}

// The expert accepts a paid (or free) request, then answers it by written reply.
export async function confirmBooking(formData) {
  const { booking, isExpert } = await myBooking(formData);
  if (!booking || !isExpert || booking.status !== "PENDING" || booking.paymentStatus === "UNPAID") return;
  const done = await prisma.booking.updateMany({
    where: { id: booking.id, status: "PENDING" },
    data: { status: "CONFIRMED", statusChangedAt: new Date() },
  });
  if (done.count === 0) return;
  await emailConfirmed({
    to: booking.student.email,
    expertName: booking.expert.user.name,
    title: booking.service.title,
  });
  refresh();
}

export async function declineBooking(formData) {
  const { booking, isExpert } = await myBooking(formData);
  if (!booking || !isExpert || booking.status !== "PENDING") return;
  const done = await prisma.booking.updateMany({
    where: { id: booking.id, status: "PENDING" },
    data: { status: "DECLINED", cancelledBy: "EXPERT", statusChangedAt: new Date() },
  });
  if (done.count === 0) return;
  await refundBooking(booking); // does nothing unless the booking was paid
  await emailDeclined({
    to: booking.student.email,
    expertName: booking.expert.user.name,
    title: booking.service.title,
    refunded: booking.paymentStatus === "PAID",
  });
  refresh();
}


export async function cancelBooking(formData) {
  const { booking, isExpert } = await myBooking(formData);
  if (!booking || !["PENDING", "CONFIRMED"].includes(booking.status)) return;

  // Once the expert's reply has reached the student, the work is done and it can't be cancelled.
  const delivered = await prisma.bookingReply.count({ where: { bookingId: booking.id, status: "SENT" } });
  if (delivered > 0) return;

  const done = await prisma.booking.updateMany({
    where: { id: booking.id, status: { in: ["PENDING", "CONFIRMED"] } },
    data: { status: "CANCELLED", cancelledBy: isExpert ? "EXPERT" : "STUDENT", statusChangedAt: new Date() },
  });
  if (done.count === 0) return;

  // Refunded at once when the expert cancels, or when the student cancels before the expert accepted.
  // A student cancelling after acceptance goes to the admin Inbox for a refund decision.
  if (isExpert || booking.status === "PENDING") await refundBooking(booking);

  const other = isExpert ? booking.student : booking.expert.user;
  const by = isExpert ? booking.expert.user : booking.student;
  await emailCancelled({
    to: other.email,
    byName: by.name,
    title: booking.service.title,
    refunded: isExpert && booking.paymentStatus === "PAID",
  });
  refresh();
}

// The expert's written answer. It is NOT sent to the student: it waits in the admin Inbox.
export async function sendReply(_prev, formData) {
  const { booking, isExpert } = await myBooking(formData);
  if (!booking || !isExpert) return { error: "Request not found." };
  if (booking.status === "COMPLETED") return { error: "This request is already completed." };
  if (booking.status !== "CONFIRMED") return { error: "Accept the request before you reply." };

  const replies = await prisma.bookingReply.findMany({ where: { bookingId: booking.id } });
  const cycle = replyCycle(booking, replies);
  if (cycle.open) return { error: "Your last reply is still waiting for Buncho's review." };
  if (cycle.delivered) return { error: "The student has your reply. You can answer again if they ask for a follow-up." };

  const body = get(formData, "body");
  if (body.length < 20) return { error: "Write at least 20 characters." };
  if (body.length > 4000) return { error: "Keep the reply under 4000 characters." };

  await prisma.bookingReply.create({ data: { bookingId: booking.id, body, flags: findContactInfo(body) } });
  revalidatePath("/dashboard");
  revalidatePath("/admin");
  return { ok: true };
}

// The student says the reply answered their question. This is what completes the request.
export async function resolveBooking(formData) {
  const { booking, isStudent } = await myBooking(formData);
  if (!booking || !isStudent || booking.status !== "CONFIRMED") return;

  const replies = await prisma.bookingReply.findMany({ where: { bookingId: booking.id } });
  if (!replyCycle(booking, replies).lastSent) return; // nothing has been delivered yet

  const done = await prisma.booking.updateMany({
    where: { id: booking.id, status: "CONFIRMED" },
    data: { status: "COMPLETED", statusChangedAt: new Date() },
  });
  if (done.count > 0) refresh();
}

// The student says the reply was not enough. The expert answers again at no extra cost.
export async function requestFollowUp(_prev, formData) {
  const { booking, isStudent } = await myBooking(formData);
  if (!booking || !isStudent) return { error: "Request not found." };
  if (booking.status !== "CONFIRMED") return { error: "This request is closed." };

  const replies = await prisma.bookingReply.findMany({ where: { bookingId: booking.id } });
  if (!replyCycle(booking, replies).delivered) return { error: "There is no new reply to respond to." };
  if (booking.followUpCount >= MAX_FOLLOW_UPS) return { error: "You've used all your free follow-ups. Contact Buncho if you still need help." };

  const note = get(formData, "note");
  if (note.length < 10) return { error: "Tell the expert what is still missing, in at least 10 characters." };
  if (note.length > 1000) return { error: "Keep it under 1000 characters." };

  // Matching the old count means a double click can't use two follow-ups at once.
  const saved = await prisma.booking.updateMany({
    where: { id: booking.id, status: "CONFIRMED", followUpCount: booking.followUpCount },
    data: { followUpNote: note, followUpAt: new Date(), followUpCount: { increment: 1 } },
  });
  if (saved.count === 0) return { error: "That was already sent." };

  await emailFollowUp({
    to: booking.expert.user.email,
    studentName: booking.student.name,
    title: booking.service.title,
    note,
  });
  refresh();
  return { ok: true };
}

// ---------- Services ----------
export async function saveService(_prev, formData) {
  const user = await requireUser("/dashboard/services");
  const expert = await prisma.expertProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
  if (!expert) return { error: "Only experts can add services." };

  const id = get(formData, "id");
  const type = get(formData, "type");
  const title = get(formData, "title");
  const description = get(formData, "description");
  const priceInr = Number.parseInt(get(formData, "priceInr"), 10);
  const durationMin = Number.parseInt(get(formData, "durationMin"), 10);
  const deliverables = get(formData, "deliverables").split("\n").map((s) => s.trim()).filter(Boolean).slice(0, 8);

  if (!Object.hasOwn(SERVICE_TYPES, type)) return { error: "Choose a service type." };
  if (title.length < 3 || title.length > 80) return { error: "Title must be 3 to 80 characters." };
  if (description.length < 10 || description.length > 500) return { error: "Description must be 10 to 500 characters." };
  if (!(priceInr >= 0 && priceInr <= 20000)) return { error: "Price must be between ₹0 and ₹20,000." };
  if (!DURATIONS.includes(durationMin)) return { error: "Choose a duration." };
  if (deliverables.some((d) => d.length > 100)) return { error: "Each deliverable must be 100 characters or fewer." };

  const data = { type, title, description, priceInr, durationMin, deliverables };
  if (id) {
    const own = await prisma.service.findFirst({ where: { id, expertId: expert.id }, select: { id: true } });
    if (!own) return { error: "Service not found." };
    await prisma.service.update({ where: { id }, data: { ...data, active: formData.get("active") === "on" } });
  } else {
    await prisma.service.create({ data: { ...data, expertId: expert.id } });
  }
  revalidatePath("/dashboard/services");
  refresh();
  return { ok: true };
}

export async function toggleService(formData) {
  const user = await requireUser("/dashboard/services");
  const service = await prisma.service.findFirst({ where: { id: get(formData, "id"), expert: { userId: user.id } } });
  if (!service) return;
  await prisma.service.update({ where: { id: service.id }, data: { active: !service.active } });
  revalidatePath("/dashboard/services");
  refresh();
}

// A service that already has bookings is hidden instead of deleted, so booking history stays intact.
export async function deleteService(formData) {
  const user = await requireUser("/dashboard/services");
  const service = await prisma.service.findFirst({
    where: { id: get(formData, "id"), expert: { userId: user.id } },
    include: { _count: { select: { bookings: true } } },
  });
  if (!service) return;
  if (service._count.bookings > 0) await prisma.service.update({ where: { id: service.id }, data: { active: false } });
  else await prisma.service.delete({ where: { id: service.id } });
  revalidatePath("/dashboard/services");
  refresh();
}

// ---------- Availability (no longer used by booking; kept until you decide to remove it) ----------
export async function addAvailability(_prev, formData) {
  const user = await requireUser("/dashboard/availability");
  const expert = await prisma.expertProfile.findUnique({ where: { userId: user.id }, select: { id: true } });
  if (!expert) return { error: "Only experts can set availability." };

  const weekday = Number.parseInt(get(formData, "weekday"), 10);
  const startMin = timeToMinutes(get(formData, "start"));
  const endMin = timeToMinutes(get(formData, "end"));
  if (!(weekday >= 0 && weekday <= 6)) return { error: "Choose a day." };
  if (startMin === null || endMin === null) return { error: "Enter a start and end time." };
  if (endMin - startMin < 30) return { error: "The window must be at least 30 minutes." };

  const overlap = await prisma.availability.findFirst({
    where: { expertId: expert.id, weekday, startMin: { lt: endMin }, endMin: { gt: startMin } },
    select: { id: true },
  });
  if (overlap) return { error: "That overlaps a window you already added for this day." };

  await prisma.availability.create({ data: { expertId: expert.id, weekday, startMin, endMin } });
  revalidatePath("/dashboard/availability");
  return { ok: true };
}

export async function deleteAvailability(formData) {
  const user = await requireUser("/dashboard/availability");
  await prisma.availability.deleteMany({ where: { id: get(formData, "id"), expert: { userId: user.id } } });
  revalidatePath("/dashboard/availability");
}
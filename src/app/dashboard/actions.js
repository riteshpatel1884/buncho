"use server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { isHttpUrl } from "@/lib/utils";
import { SERVICE_TYPES, DURATIONS, timeToMinutes } from "@/lib/constants";
import { emailConfirmed, emailDeclined, emailCancelled } from "@/lib/email";

const get = (fd, k) => String(fd.get(k) || "").trim();
const refresh = () => {
  revalidatePath("/dashboard");
  revalidatePath("/experts");
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

export async function confirmBooking(formData) {
  const { booking, isExpert } = await myBooking(formData);
  if (!booking || !isExpert || booking.status !== "PENDING") return;
  const meetingUrl = get(formData, "meetingUrl");
  const link = meetingUrl && isHttpUrl(meetingUrl) ? meetingUrl : null;
  await prisma.booking.update({
    where: { id: booking.id },
    data: { status: "CONFIRMED", meetingUrl: link },
  });
  await emailConfirmed({
    to: booking.student.email,
    expertName: booking.expert.user.name,
    title: booking.service.title,
    startsAt: booking.startsAt,
    meetingUrl: link,
  });
  refresh();
}

export async function declineBooking(formData) {
  const { booking, isExpert } = await myBooking(formData);
  if (!booking || !isExpert || booking.status !== "PENDING") return;
  await prisma.booking.update({ where: { id: booking.id }, data: { status: "DECLINED" } });
  await emailDeclined({
    to: booking.student.email,
    expertName: booking.expert.user.name,
    title: booking.service.title,
    startsAt: booking.startsAt,
  });
  refresh();
}

export async function completeBooking(formData) {
  const { booking, isExpert } = await myBooking(formData);
  if (!booking || !isExpert || booking.status !== "CONFIRMED" || booking.startsAt > new Date()) return;
  await prisma.booking.update({ where: { id: booking.id }, data: { status: "COMPLETED" } });
  refresh();
}

export async function cancelBooking(formData) {
  const { booking, isExpert } = await myBooking(formData);
  if (!booking || !["PENDING", "CONFIRMED"].includes(booking.status)) return;
  await prisma.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED" } });
  const other = isExpert ? booking.student : booking.expert.user;
  const by = isExpert ? booking.expert.user : booking.student;
  await emailCancelled({
    to: other.email,
    byName: by.name,
    title: booking.service.title,
    startsAt: booking.startsAt,
  });
  refresh();
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

// ---------- Availability ----------
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

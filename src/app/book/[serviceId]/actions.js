"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { buildSlots } from "@/lib/slots";

// Creates a booking request. The chosen time is re-checked against the expert's real open slots.
export async function createBooking(_prev, formData) {
  const serviceId = String(formData.get("serviceId") || "");
  const startsIso = String(formData.get("startsAt") || "");
  const note = String(formData.get("note") || "").trim().slice(0, 500);

  const user = await requireUser(`/book/${serviceId}`);
  if (user.role !== "STUDENT") return { error: "Only student accounts can book sessions." };
  if (!startsIso) return { error: "Choose a day and time." };

  const service = await prisma.service.findFirst({
    where: { id: serviceId, active: true, expert: { status: "ACTIVE" } },
    include: { expert: { include: { availability: true } } },
  });
  if (!service) return { error: "This service is no longer available." };
  if (service.expert.userId === user.id) return { error: "You can't book your own service." };

  const horizon = new Date(Date.now() + 16 * 24 * 60 * 60 * 1000);
  const busy = await prisma.booking.findMany({
    where: { expertId: service.expertId, status: { in: ["PENDING", "CONFIRMED"] }, startsAt: { lt: horizon } },
    select: { startsAt: true, endsAt: true },
  });
  const days = buildSlots({ availability: service.expert.availability, busy, durationMin: service.durationMin });
  if (!days.some((d) => d.slots.some((s) => s.iso === startsIso))) {
    return { error: "That time was just taken. Please choose another." };
  }

  const startsAt = new Date(startsIso);
  const endsAt = new Date(startsAt.getTime() + service.durationMin * 60000);

  try {
    await prisma.$transaction(
      async (tx) => {
        const clash = await tx.booking.findFirst({
          where: { expertId: service.expertId, status: { in: ["PENDING", "CONFIRMED"] }, startsAt: { lt: endsAt }, endsAt: { gt: startsAt } },
          select: { id: true },
        });
        if (clash) throw new Error("CLASH");
        await tx.booking.create({
          data: {
            studentId: user.id, expertId: service.expertId, serviceId: service.id,
            startsAt, endsAt, note: note || null, priceInr: service.priceInr,
          },
        });
      },
      { isolationLevel: "Serializable" }
    );
  } catch (e) {
    return { error: e.message === "CLASH" ? "That time was just taken. Please choose another." : "Something went wrong. Please try again." };
  }
  redirect("/dashboard?booked=1");
}

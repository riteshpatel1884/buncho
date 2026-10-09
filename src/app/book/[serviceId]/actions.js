"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { buildSlots } from "@/lib/slots";
import { emailNewRequest } from "@/lib/email";
import { activeHold, createBookingCheckout } from "@/lib/bookingPayment";

// Creates a booking request. The chosen time is re-checked against the expert's real open slots.
// Paid services go to Dodo checkout first; the expert is only told after the payment succeeds.
export async function createBooking(_prev, formData) {
  const serviceId = String(formData.get("serviceId") || "");
  const startsIso = String(formData.get("startsAt") || "");
  const note = String(formData.get("note") || "").trim().slice(0, 500);

  const user = await requireUser(`/book/${serviceId}`);
  if (user.role !== "STUDENT") return { error: "Only student accounts can book sessions." };
  if (!startsIso) return { error: "Choose a day and time." };

  const service = await prisma.service.findFirst({
    where: { id: serviceId, active: true, expert: { status: "ACTIVE" } },
    include: { expert: { include: { availability: true, user: { select: { name: true, email: true } } } } },
  });
  if (!service) return { error: "This service is no longer available." };
  if (service.expert.userId === user.id) return { error: "You can't book your own service." };

  const horizon = new Date(Date.now() + 16 * 24 * 60 * 60 * 1000);
  const busy = await prisma.booking.findMany({
    where: { expertId: service.expertId, startsAt: { lt: horizon }, ...activeHold() },
    select: { startsAt: true, endsAt: true },
  });
  const days = buildSlots({ availability: service.expert.availability, busy, durationMin: service.durationMin });
  if (!days.some((d) => d.slots.some((s) => s.iso === startsIso))) {
    return { error: "That time was just taken. Please choose another." };
  }

  const startsAt = new Date(startsIso);
  const endsAt = new Date(startsAt.getTime() + service.durationMin * 60000);
  const paid = service.priceInr > 0;

  let booking;
  try {
    booking = await prisma.$transaction(
      async (tx) => {
        const clash = await tx.booking.findFirst({
          where: { expertId: service.expertId, startsAt: { lt: endsAt }, endsAt: { gt: startsAt }, ...activeHold() },
          select: { id: true },
        });
        if (clash) throw new Error("CLASH");
        // One open payment per student, so nobody can block many slots with unpaid requests.
        await tx.booking.updateMany({
          where: { studentId: user.id, status: "PENDING", paymentStatus: "UNPAID" },
          data: { status: "CANCELLED" },
        });
        return tx.booking.create({
          data: {
            studentId: user.id, expertId: service.expertId, serviceId: service.id,
            startsAt, endsAt, note: note || null,
            priceInr: service.priceInr, // price at the moment of booking
            paymentStatus: paid ? "UNPAID" : "FREE",
          },
        });
      },
      { isolationLevel: "Serializable" }
    );
  } catch (e) {
    return { error: e.message === "CLASH" ? "That time was just taken. Please choose another." : "Something went wrong. Please try again." };
  }

  if (!paid) {
    // Free service: tell the expert now. A failed email is only logged, it never blocks the booking.
    await emailNewRequest({ to: service.expert.user.email, studentName: user.name, title: service.title, startsAt, note });
    redirect("/dashboard?booked=1");
  }

  let checkoutUrl = null;
  try {
    checkoutUrl = await createBookingCheckout({ booking, user });
  } catch (e) {
    console.error("[booking checkout] failed:", e?.message);
    await prisma.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED" } });
    return { error: "We couldn't open the payment page. Please try again." };
  }
  redirect(checkoutUrl); // outside try/catch, redirect() throws on purpose
}
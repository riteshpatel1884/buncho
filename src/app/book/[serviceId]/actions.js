"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { emailAdmin } from "@/lib/email";
import { findContactInfo } from "@/lib/contactCheck";
import { createBookingCheckout } from "@/lib/bookingPayment";

// Creates a request. The student's written question is the main part of it.
// Paid services go to Dodo checkout first. Either way, an admin reads the request before the expert sees it.
export async function createBooking(_prev, formData) {
  const serviceId = String(formData.get("serviceId") || "");
  const note = String(formData.get("note") || "").trim().slice(0, 1000);

  const user = await requireUser(`/book/${serviceId}`);
  if (user.role !== "STUDENT") return { error: "Only student accounts can book sessions." };
  if (note.length < 20) return { error: "Tell the expert what you need help with, in at least 20 characters." };

  const service = await prisma.service.findFirst({
    where: { id: serviceId, active: true, expert: { status: "ACTIVE" } },
    include: { expert: { select: { userId: true } } },
  });
  if (!service) return { error: "This service is no longer available." };
  if (service.expert.userId === user.id) return { error: "You can't book your own service." };

  const paid = service.priceInr > 0;
  const flags = findContactInfo(note);

  let booking;
  try {
    // Checkouts this student left unpaid are closed, so they don't pile up.
    const [, created] = await prisma.$transaction([
      prisma.booking.updateMany({
        where: { studentId: user.id, status: "PENDING", paymentStatus: "UNPAID" },
        data: { status: "CANCELLED", statusChangedAt: new Date() },
      }),
      prisma.booking.create({
        data: {
          studentId: user.id,
          expertId: service.expertId,
          serviceId: service.id,
          note,
          noteFlags: flags,
          reviewStatus: "PENDING_REVIEW",
          priceInr: service.priceInr, // price at the moment of booking
          paymentStatus: paid ? "UNPAID" : "FREE",
        },
      }),
    ]);
    booking = created;
  } catch (e) {
    console.error("[booking] create failed:", e?.message);
    return { error: "Something went wrong. Please try again." };
  }

  if (!paid) {
    // Free service: it goes straight to the admin Inbox. A failed email is only logged.
    await emailAdmin({
      subject: "New request to approve",
      lines: [
        `${user.name || "A student"} sent a free request for ${service.title}.`,
        ...(flags.length ? [`Possible contact info in the message: ${flags.join(", ")}.`] : []),
      ],
    });
    redirect("/dashboard?booked=1");
  }

  let checkoutUrl = null;
  try {
    checkoutUrl = await createBookingCheckout({ booking, user });
  } catch (e) {
    console.error("[booking checkout] failed:", e?.message);
    await prisma.booking.update({ where: { id: booking.id }, data: { status: "CANCELLED", statusChangedAt: new Date() } });
    return { error: "We couldn't open the payment page. Please try again." };
  }
  redirect(checkoutUrl); // outside try/catch, redirect() throws on purpose
}
"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { createCheckout, newOrderId } from "@/lib/cashfree";
import { BLUE_TICK_PRICE_INR, canBuyBlueTick } from "@/lib/blueTick";

const PAGE = "/dashboard/verification";

// Experts and normal users (students) can both buy the blue tick.
async function requireHolderUser() {
  const user = await requireUser(PAGE);
  if (!user.role) redirect("/onboarding");
  if (user.role !== "EXPERT" && user.role !== "STUDENT") redirect("/dashboard");
  return user;
}

export async function startBlueTick() {
  const user = await requireHolderUser();

  let holderId;
  let until;
  if (user.role === "EXPERT") {
    const expert = await prisma.expertProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, status: true, blueTickUntil: true },
    });
    if (!expert) redirect("/onboarding/expert");
    if (expert.status !== "ACTIVE") redirect(`${PAGE}?error=approval`);
    holderId = expert.id;
    until = expert.blueTickUntil;
  } else {
    holderId = user.id;
    until = user.blueTickUntil;
  }
  if (!canBuyBlueTick(until)) redirect(PAGE);

  let url;
  try {
    url = await createCheckout({
      orderId: newOrderId(user.role === "EXPERT" ? "be" : "bu", holderId),
      amountInr: BLUE_TICK_PRICE_INR,
      user,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL}${PAGE}?checkout=done&order_id={order_id}`,
      note: "Buncho blue tick (30 days)",
      expiryMinutes: 30,
    });
  } catch (e) {
    console.error("[blue tick] checkout failed:", e?.message);
    redirect(`${PAGE}?error=checkout`);
  }
  redirect(url); // keep outside try/catch, redirect() throws on purpose
}
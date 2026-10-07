"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/user";
import { dodo } from "@/lib/dodo";

const PAGE = "/dashboard/verification";

export async function startBlueTick() {
  const user = await requireRole("EXPERT", PAGE);
  const expert = await prisma.expertProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, status: true, blueTickUntil: true },
  });
  if (!expert) redirect("/onboarding/expert");
  if (expert.status !== "ACTIVE") redirect(`${PAGE}?error=approval`);
  if (expert.blueTickUntil && expert.blueTickUntil > new Date()) redirect(PAGE);

  const session = await dodo.checkoutSessions.create({
    product_cart: [{ product_id: process.env.DODO_VERIFY_PRODUCT_ID, quantity: 1 }],
    customer: { email: user.email, name: user.name || undefined },
    metadata: { expertId: expert.id },
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}${PAGE}?checkout=done`,
  });
  redirect(session.checkout_url); // keep outside try/catch, redirect() throws on purpose
}

// Stops renewal. The tick stays until the period already paid for ends.
export async function cancelBlueTick() {
  const user = await requireRole("EXPERT", PAGE);
  const expert = await prisma.expertProfile.findUnique({
    where: { userId: user.id },
    select: { id: true, dodoSubscriptionId: true },
  });
  if (!expert?.dodoSubscriptionId) return;
  await dodo.subscriptions.update(expert.dodoSubscriptionId, { cancel_at_next_billing_date: true });
  await prisma.expertProfile.update({ where: { id: expert.id }, data: { dodoStatus: "CANCELLING" } });
  revalidatePath(PAGE);
}
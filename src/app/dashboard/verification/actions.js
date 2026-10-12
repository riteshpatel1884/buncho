"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { dodo } from "@/lib/dodo";

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

  let metadata;
  let until;
  if (user.role === "EXPERT") {
    const expert = await prisma.expertProfile.findUnique({
      where: { userId: user.id },
      select: { id: true, status: true, blueTickUntil: true },
    });
    if (!expert) redirect("/onboarding/expert");
    if (expert.status !== "ACTIVE") redirect(`${PAGE}?error=approval`);
    metadata = { expertId: expert.id };
    until = expert.blueTickUntil;
  } else {
    metadata = { userId: user.id };
    until = user.blueTickUntil;
  }
  if (until && until > new Date()) redirect(PAGE);

  const session = await dodo.checkoutSessions.create({
    product_cart: [{ product_id: process.env.DODO_VERIFY_PRODUCT_ID, quantity: 1 }],
    customer: { email: user.email, name: user.name || undefined },
    metadata,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}${PAGE}?checkout=done`,
  });
  redirect(session.checkout_url); // keep outside try/catch, redirect() throws on purpose
}

// Stops renewal. The tick stays until the period already paid for ends.
export async function cancelBlueTick() {
  const user = await requireHolderUser();
  const isExpert = user.role === "EXPERT";

  const holder = isExpert
    ? await prisma.expertProfile.findUnique({ where: { userId: user.id }, select: { id: true, dodoSubscriptionId: true } })
    : await prisma.user.findUnique({ where: { id: user.id }, select: { id: true, dodoSubscriptionId: true } });
  if (!holder?.dodoSubscriptionId) return;

  await dodo.subscriptions.update(holder.dodoSubscriptionId, { cancel_at_next_billing_date: true });
  const table = isExpert ? prisma.expertProfile : prisma.user;
  await table.update({ where: { id: holder.id }, data: { dodoStatus: "CANCELLING" } });
  revalidatePath(PAGE);
}
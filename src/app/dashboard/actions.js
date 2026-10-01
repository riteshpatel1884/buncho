"use server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getOrCreateUser } from "@/lib/user";
import { createVerificationCheckout, VERIFY_PRICE_INR } from "@/lib/dodo";

// Starts the ₹49 verification checkout. Verification is only granted by the Dodo webhook after payment.
export async function startVerification(formData) {
  const user = await getOrCreateUser();
  if (!user) redirect("/sign-in");

  const productId = String(formData.get("productId") || "");
  const product = await prisma.product.findFirst({ where: { id: productId, userId: user.id, status: "APPROVED" } });
  if (!product || product.verified) redirect("/dashboard");

  const payment = await prisma.payment.create({
    data: { userId: user.id, productId: product.id, amount: VERIFY_PRICE_INR },
  });

  let checkoutUrl;
  try {
    const session = await createVerificationCheckout({
      paymentId: payment.id,
      productId: product.id,
      userId: user.id,
      email: user.email,
      name: user.name,
      returnUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/dashboard?verification=processing`,
    });
    await prisma.payment.update({ where: { id: payment.id }, data: { sessionId: session.session_id } });
    checkoutUrl = session.checkout_url;
  } catch (e) {
    console.error(e);
    await prisma.payment.update({ where: { id: payment.id }, data: { status: "FAILED" } });
    redirect("/dashboard?verification=error");
  }
  redirect(checkoutUrl);
}
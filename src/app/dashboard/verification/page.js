import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/user";
import { getPaidOrder, parseOrderId } from "@/lib/cashfree";
import { applyPayment, canBuyBlueTick, BLUE_TICK_PRICE_INR, BLUE_TICK_DAYS } from "@/lib/blueTick";
import SubmitButton from "@/components/SubmitButton";
import { BlueTick, isBlueTick } from "@/components/Badges";
import { startBlueTick } from "./actions";
import { IST } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "Blue tick | buncho" };

export default async function VerificationPage({ searchParams }) {
  const user = await requireUser("/dashboard/verification");
  if (!user.role) redirect("/onboarding");
  if (user.role !== "EXPERT" && user.role !== "STUDENT") redirect("/dashboard");
  const sp = await searchParams;

  // Experts keep the tick on their expert profile. Everyone else keeps it on their account.
  const isExpert = user.role === "EXPERT";
  const load = () =>
    isExpert
      ? prisma.expertProfile.findUnique({ where: { userId: user.id } })
      : prisma.user.findUnique({ where: { id: user.id } });

  let holder = await load();
  if (!holder) redirect("/onboarding/expert");

  // Return from checkout: ask Cashfree if the order is paid and save it. Safe to run twice.
  const orderId = typeof sp.order_id === "string" ? sp.order_id : null;
  if (orderId) {
    try {
      const parsed = parseOrderId(orderId);
      const prefix = isExpert ? "be" : "bu";
      if (parsed && parsed.prefix === prefix && parsed.id === holder.id) {
        const paid = await getPaidOrder(orderId);
        if (paid) {
          const res = await applyPayment(paid, { holder: { type: isExpert ? "expert" : "user", id: holder.id } });
          console.log("[blue tick] payment sync", orderId, res);
        }
      } else {
        console.error("[blue tick] order does not belong to this account", orderId);
      }
    } catch (e) {
      console.error("[blue tick] payment sync failed:", e?.message);
    }
    holder = await load();
  }

  const active = isBlueTick(holder);
  const canBuy = canBuyBlueTick(holder.blueTickUntil);
  const until = holder.blueTickUntil
    ? new Intl.DateTimeFormat("en-IN", { timeZone: IST, day: "numeric", month: "short", year: "numeric" }).format(holder.blueTickUntil)
    : null;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-ink">Back to dashboard</Link>
      <div>
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold sm:text-4xl">Blue tick <BlueTick className="h-7 w-7" /></h1>
        <p className="mt-1 text-muted">
          {isExpert
            ? "Show a blue tick next to your name on your profile, in search, and on your posts and comments."
            : "Show a blue tick next to your name on your posts and comments."}{" "}
          ₹{BLUE_TICK_PRICE_INR} for {BLUE_TICK_DAYS} days. Buy again whenever you want to keep it.
        </p>
      </div>

      {sp.checkout === "done" && !active && (
        <p role="status" className="rounded-xl bg-brand-soft p-4 text-sm font-medium text-brand">
          Payment received. Your tick appears within a minute. Refresh this page if it hasn't yet.
        </p>
      )}
      {sp.error === "approval" && (
        <p role="alert" className="rounded-xl bg-warn-soft p-4 text-sm text-warn">The blue tick is available once your profile is approved and live.</p>
      )}
      {sp.error === "checkout" && (
        <p role="alert" className="rounded-xl bg-danger-soft p-4 text-sm text-danger">We couldn't open the payment page. Please try again.</p>
      )}

      <div className="card space-y-4 p-5 sm:p-8">
        {active ? (
          <>
            <p className="font-semibold">Your blue tick is active.</p>
            <p className="text-sm text-muted">Stays until {until}. It does not renew by itself.</p>
            {canBuy && (
              <form action={startBlueTick}>
                <SubmitButton className="btn-outline" pendingText="Opening checkout">Add {BLUE_TICK_DAYS} more days</SubmitButton>
              </form>
            )}
          </>
        ) : (
          <>
            <p className="font-display text-3xl font-bold">₹{BLUE_TICK_PRICE_INR} <span className="text-base font-normal text-muted">for {BLUE_TICK_DAYS} days</span></p>
            <form action={startBlueTick}>
              <SubmitButton className="btn-primary" pendingText="Opening checkout">Get the blue tick</SubmitButton>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
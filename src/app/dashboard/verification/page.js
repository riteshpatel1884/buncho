import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/user";
import { dodo } from "@/lib/dodo";
import { applySubscription, applyPayment } from "@/lib/blueTick";
import SubmitButton from "@/components/SubmitButton";
import { BlueTick, isBlueTick } from "@/components/Badges";
import { startBlueTick, cancelBlueTick } from "./actions";
import { IST } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const metadata = { title: "Blue tick | buncho" };

export default async function VerificationPage({ searchParams }) {
  const user = await requireRole("EXPERT", "/dashboard/verification");
  const sp = await searchParams;
    let expert = await prisma.expertProfile.findUnique({ where: { userId: user.id } });
  if (!expert) redirect("/onboarding/expert");

  // 1) Return from checkout: verify the payment with Dodo and save it.
  const paymentId = typeof sp.payment_id === "string" ? sp.payment_id : null;
  if (paymentId) {
    try {
      const payment = await dodo.payments.retrieve(paymentId);
      const mine =
        payment.metadata?.expertId === expert.id ||
        payment.customer?.email?.toLowerCase() === user.email.toLowerCase();
      if (mine) {
        const res = await applyPayment(payment, { expertId: expert.id });
        console.log("[blue tick] payment sync", paymentId, res);
      } else {
        console.error("[blue tick] payment does not belong to this expert", paymentId);
      }
    } catch (e) {
      console.error("[blue tick] payment sync failed:", e?.message);
    }
    expert = await prisma.expertProfile.findUnique({ where: { userId: user.id } });
  }

  // 2) Existing subscription: keep the status fresh.
  const subId = (typeof sp.subscription_id === "string" && sp.subscription_id) || expert.dodoSubscriptionId;
  if (subId) {
    try {
      const sub = await dodo.subscriptions.retrieve(subId);
      const mine =
        sub.metadata?.expertId === expert.id ||
        sub.subscription_id === expert.dodoSubscriptionId ||
        sub.customer?.email?.toLowerCase() === user.email.toLowerCase();
      if (mine) {
        await applySubscription(sub, { expertId: expert.id });
        expert = await prisma.expertProfile.findUnique({ where: { userId: user.id } });
      }
    } catch (e) {
      console.error("[blue tick] sync failed:", e?.message);
    }
  }

  const active = isBlueTick(expert);
  const until = expert.blueTickUntil
    ? new Intl.DateTimeFormat("en-IN", { timeZone: IST, day: "numeric", month: "short", year: "numeric" }).format(expert.blueTickUntil)
    : null;
  const renewing = active && expert.dodoStatus === "ACTIVE";

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-ink">Back to dashboard</Link>
      <div>
        <h1 className="flex items-center gap-2 font-display text-3xl font-bold sm:text-4xl">Blue tick <BlueTick className="h-7 w-7" /></h1>
        <p className="mt-1 text-muted">Show a blue tick next to your name on your profile and in search. ₹99 per month, cancel any time.</p>
      </div>

      {sp.checkout === "done" && !active && (
        <p role="status" className="rounded-xl bg-brand-soft p-4 text-sm font-medium text-brand">
          Payment received. Your tick appears within a minute. Refresh this page if it hasn't yet.
        </p>
      )}
      {sp.error === "approval" && (
        <p role="alert" className="rounded-xl bg-warn-soft p-4 text-sm text-warn">The blue tick is available once your profile is approved and live.</p>
      )}
      {expert.dodoStatus === "ON_HOLD" && (
        <p role="alert" className="rounded-xl bg-danger-soft p-4 text-sm text-danger">Your last renewal payment failed. Update your payment method from the Dodo receipt email, or buy again below once it lapses.</p>
      )}

      <div className="card space-y-4 p-5 sm:p-8">
        {active ? (
          <>
            <p className="font-semibold">Your blue tick is active.</p>
            <p className="text-sm text-muted">
              {renewing ? `Renews on ${until}.` : `Stays until ${until}, then it will not renew.`}
            </p>
            {renewing && (
              <form action={cancelBlueTick}>
                <SubmitButton className="btn-outline" pendingText="Cancelling">Cancel renewal</SubmitButton>
              </form>
            )}
          </>
        ) : (
          <>
            <p className="font-display text-3xl font-bold">₹99 <span className="text-base font-normal text-muted">per month</span></p>
            <form action={startBlueTick}>
              <SubmitButton className="btn-primary" pendingText="Opening checkout">Get the blue tick</SubmitButton>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
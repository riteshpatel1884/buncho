import LegalPage from "@/components/LegalPage";

export const metadata = { title: "Refund and Cancellation Policy | buncho" };

const sections = [
  { id: "summary", title: "In short", body: [
    ["If the expert declines or cancels, you get a full refund.", "If you cancel before the expert accepts, you get a full refund.", "If you cancel after the expert accepts, Buncho reviews your case before deciding on a refund.", "Once an expert's reply has been delivered to you, the request can no longer be cancelled."],
  ]},
  { id: "payment", title: "How payment works", body: [
    "Prices are in Indian rupees (INR). You pay on a secure checkout page run by our payment partner, Dodo Payments. After a successful payment your request is sent to the expert.",
    "If your payment doesn't go through, no request is sent and you aren't charged. An unpaid request stays visible for 20 minutes while the payment can still complete. If money was taken but the request wasn't created, contact us and we will fix it or refund you.",
  ]},
  { id: "declined", title: "When the expert declines or cancels", body: [
    "If the expert declines your request, or cancels it at any point before delivering a reply, we refund the full amount automatically to your original payment method. You don't need to ask.",
  ]},
  { id: "student-cancel", title: "When you cancel", body: [
    ["Before the expert accepts: full refund, started automatically.", "After the expert accepts but before a reply is delivered: Buncho reviews the cancellation and decides on a full, partial or no refund, depending on how much work has been done. We email you the decision."],
    "You can cancel a request from your dashboard while it is pending or accepted.",
  ]},
  { id: "delivered", title: "After a reply is delivered", body: [
    "Once the expert's reply has been sent to you, the work is considered done and the request can't be cancelled. If the reply doesn't answer your question, use the free follow-up (up to 2 per request) from your dashboard.",
    "If you believe a reply was irrelevant, copied, abusive or broke our rules, contact us within 7 days of receiving it. We will look into it and may refund fully or partly.",
  ]},
  { id: "timing", title: "How long refunds take", body: [
    "We start the refund as soon as it is approved. It usually reaches your account within 5 to 10 working days, depending on your bank or payment method. If the automatic refund fails, your request is marked for the Buncho team, who will complete it manually and email you.",
  ]},
  { id: "blue-tick", title: "Blue tick subscription", body: [
    "The expert blue tick renews monthly until cancelled. You can cancel renewal from your dashboard at any time. The tick stays active until the end of the period you paid for. Payments for a period that has already started are not refunded, except where the law requires it or a charge was made by mistake.",
  ]},
  { id: "disputes", title: "Chargebacks and disputes", body: [
    "Please contact us before raising a dispute with your bank so we can fix the problem quickly. Accounts linked to fraudulent chargebacks may be suspended.",
  ]},
  { id: "how", title: "How to ask for a refund", body: [
    "Open the Contact page, tell us the email on your account, the expert and service name, the date, and what went wrong. We acknowledge every request within 48 hours.",
  ]},
];

export default function Refunds() {
  return <LegalPage title="Refund and Cancellation Policy" intro="Clear rules for payments, cancellations and refunds, so there are no surprises." sections={sections} />;
}
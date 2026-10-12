import { notFound } from "next/navigation";
import CashfreeCheckout from "@/components/CashfreeCheckout";

export const dynamic = "force-dynamic";
export const metadata = { title: "Payment | buncho", robots: { index: false } };

export default async function PayPage({ searchParams }) {
  const sp = await searchParams;
  const sessionId = typeof sp.s === "string" ? sp.s : "";
  if (!/^session_[A-Za-z0-9_-]+$/.test(sessionId)) notFound();

  const mode = String(process.env.CASHFREE_ENVIRONMENT || "sandbox").toLowerCase() === "production" ? "production" : "sandbox";

  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <CashfreeCheckout sessionId={sessionId} mode={mode} />
    </div>
  );
}
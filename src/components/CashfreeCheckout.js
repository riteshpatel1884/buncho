"use client";
import { useEffect, useRef, useState } from "react";

const SDK = "https://sdk.cashfree.com/js/v3/cashfree.js";

function loadSdk() {
  return new Promise((resolve, reject) => {
    if (window.Cashfree) return resolve(window.Cashfree);
    const existing = document.querySelector(`script[src="${SDK}"]`);
    const script = existing || document.createElement("script");
    script.addEventListener("load", () => resolve(window.Cashfree));
    script.addEventListener("error", () => reject(new Error("Could not load the payment page. Check your connection and try again.")));
    if (!existing) {
      script.src = SDK;
      script.async = true;
      document.head.appendChild(script);
    }
  });
}

export default function CashfreeCheckout({ sessionId, mode }) {
  const [error, setError] = useState("");
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    loadSdk()
      .then(async (Cashfree) => {
        const cashfree = Cashfree({ mode });
        const res = await cashfree.checkout({ paymentSessionId: sessionId, redirectTarget: "_self" });
        if (res?.error) setError(res.error.message || "We couldn't open the payment page.");
      })
      .catch((e) => setError(e?.message || "We couldn't open the payment page."));
  }, [sessionId, mode]);

  if (error) {
    return (
      <div className="card space-y-3 p-6">
        <p role="alert" className="text-sm text-danger">{error}</p>
        <a href="/dashboard" className="btn-outline inline-block">Back to dashboard</a>
      </div>
    );
  }
  return <p className="text-muted">Opening the secure payment page…</p>;
}
"use client";
import { useEffect, useState } from "react";
import { showToast } from "./Toast";
import { savePushSubscription, removePushSubscription } from "@/app/notifications/actions";

const PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function keyToBytes(base64) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

// "Turn on push notifications". Nothing is asked of the browser until the person taps the button.
export default function PushOptIn() {
  const [state, setState] = useState("loading"); // loading | unsupported | blocked | off | on | busy

  useEffect(() => {
    if (!PUBLIC_KEY) return setState("unsupported");
    if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) return setState("unsupported");
    if (Notification.permission === "denied") return setState("blocked");
    navigator.serviceWorker
      .register("/sw.js")
      .then(() => navigator.serviceWorker.ready)
      .then((reg) => reg.pushManager.getSubscription())
      .then((sub) => setState(sub && Notification.permission === "granted" ? "on" : "off"))
      .catch(() => setState("unsupported"));
  }, []);

  async function enable() {
    setState("busy");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return setState(permission === "denied" ? "blocked" : "off");
      const reg = await navigator.serviceWorker.ready;
      const sub = (await reg.pushManager.getSubscription()) ?? (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: keyToBytes(PUBLIC_KEY) }));
      const res = await savePushSubscription(sub.toJSON());
      if (res?.error) { showToast(res.error, "info"); return setState("off"); }
      showToast("Push notifications are on", "success");
      setState("on");
    } catch {
      showToast("Couldn't turn on push notifications", "info");
      setState("off");
    }
  }

  async function disable() {
    setState("busy");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await removePushSubscription(sub.endpoint);
        await sub.unsubscribe();
      }
      showToast("Push notifications are off", "info");
    } catch {}
    setState("off");
  }

  if (state === "loading" || state === "unsupported") return null;

  return (
    <div className="card flex items-center gap-3 p-4">
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 8a6 6 0 1 1 12 0c0 7 3 8 3 8H3s3-1 3-8zM10 20a2 2 0 0 0 4 0" /></svg>
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">Push notifications</p>
        <p className="text-xs text-muted">
          {state === "blocked"
            ? "Blocked in your browser settings. Allow notifications for Buncho there to turn this on."
            : state === "on"
              ? "On for this device, even when Buncho is closed."
              : "Get a notification on this device when something happens, even when Buncho is closed."}
        </p>
      </div>
      {state === "off" && <button type="button" onClick={enable} className="btn-primary shrink-0 cursor-pointer !rounded-full !px-4 !py-1.5 !text-[13px]">Turn on</button>}
      {state === "on" && <button type="button" onClick={disable} className="btn-outline shrink-0 cursor-pointer !rounded-full !px-4 !py-1.5 !text-[13px]">Turn off</button>}
      {state === "busy" && <span className="shrink-0 text-xs text-muted">Please wait…</span>}
    </div>
  );
}
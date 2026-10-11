"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

const EVENT = "buncho:toast";
const DURATION = 3200;

// Call from any client component: showToast("Post published", "success")
// kinds: success | like | save | info | error
export function showToast(message, kind = "success") {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { message, kind } }));
}

const STYLE = {
  success: { color: "text-brand", path: "M5 13l4 4L19 7" },
  like: { color: "text-[#f43f5e]", path: "M12 21s-7.5-4.6-9.5-9.2C1 8.4 3 5 6.4 5c2 0 3.6 1 4.6 2.6C12 6 13.6 5 15.6 5 19 5 21 8.4 19.5 11.8 19.5 11.8 12 21 12 21z" },
  save: { color: "text-brand", path: "M6 3h12v18l-6-4-6 4z" },
  info: { color: "text-brand", path: "M12 8h.01M11 12h1v5h1" },
  error: { color: "text-danger", path: "M12 8v5M12 17h.01" },
};

export default function ToastHost() {
  const [toasts, setToasts] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    let n = 0;
    const onToast = (e) => {
      const id = ++n;
      const t = { id, ...e.detail, leaving: false };
      setToasts((list) => [...list.slice(-2), t]);
      setTimeout(() => setToasts((list) => list.map((x) => (x.id === id ? { ...x, leaving: true } : x))), DURATION);
      setTimeout(() => setToasts((list) => list.filter((x) => x.id !== id)), DURATION + 260);
    };
    window.addEventListener(EVENT, onToast);
    return () => window.removeEventListener(EVENT, onToast);
  }, []);

  if (!mounted) return null;
  return createPortal(
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-20 z-[100] flex flex-col items-center gap-2 px-4 md:bottom-6">
      {toasts.map((t) => {
        const s = STYLE[t.kind] ?? STYLE.success;
        return (
          <div key={t.id} data-leaving={t.leaving} role={t.kind === "error" ? "alert" : "status"}
            className="toast pointer-events-auto relative w-full max-w-sm overflow-hidden rounded-xl border border-line bg-surface shadow-2xl">
            <div className="flex items-center gap-3 px-4 py-3">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-2 ${s.color}`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={t.kind === "like" || t.kind === "save" ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={s.path} /></svg>
              </span>
              <p className="text-sm font-medium">{t.message}</p>
            </div>
            <span className={`toast-bar absolute inset-x-0 bottom-0 h-0.5 bg-current ${s.color}`} style={{ "--dur": `${DURATION}ms` }} />
          </div>
        );
      })}
    </div>,
    document.body
  );
}
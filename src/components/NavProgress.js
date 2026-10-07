"use client";
import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

// Thin progress bar at the top of the page while a navigation is loading.
export default function NavProgress() {
  const pathname = usePathname();
  const search = useSearchParams();
  const [state, setState] = useState("idle");

  useEffect(() => {
    setState((s) => (s === "loading" ? "done" : s));
    const t = setTimeout(() => setState((s) => (s === "done" ? "idle" : s)), 500);
    return () => clearTimeout(t);
  }, [pathname, search]);

  useEffect(() => {
    function onClick(e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = e.target.closest?.("a");
      if (!a || !a.href || a.target === "_blank" || a.hasAttribute("download")) return;
      const url = new URL(a.href, location.href);
      if (url.origin !== location.origin) return;
      if (url.pathname === location.pathname && url.search === location.search) return;
      setState("loading");
    }
    function onSubmit(e) {
      if (e.target?.dataset?.nav !== undefined) setState("loading");
    }
    document.addEventListener("click", onClick);
    document.addEventListener("submit", onSubmit);
    return () => {
      document.removeEventListener("click", onClick);
      document.removeEventListener("submit", onSubmit);
    };
  }, []);

  useEffect(() => {
    if (state !== "loading") return;
    const t = setTimeout(() => setState("done"), 15000);
    return () => clearTimeout(t);
  }, [state]);

  const style =
    state === "loading"
      ? { width: "80%", opacity: 1, transition: "width 8s cubic-bezier(0.1, 0.6, 0.2, 1)" }
      : state === "done"
      ? { width: "100%", opacity: 0, transition: "width 0.25s ease-out, opacity 0.35s ease 0.15s" }
      : { width: "0%", opacity: 0, transition: "none" };

  return <div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[60] h-[3px] bg-brand" style={style} />;
}

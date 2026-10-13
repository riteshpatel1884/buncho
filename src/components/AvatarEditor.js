"use client";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Avatar from "./Avatar";
import { showToast } from "./Toast";
import { updateAvatar } from "@/app/feed/actions";
import { AVATAR_COLORS, AVATAR_ICONS, isDefaultPhoto, isHexColor } from "@/lib/avatar";

const SWATCH = {
  brand: "var(--brand)", coral: "#f97316", amber: "#f59e0b", emerald: "#10b981", teal: "#14b8a6",
  sky: "#0ea5e9", violet: "#8b5cf6", pink: "#ec4899", slate: "#64748b",
};

// The person's avatar with a small pencil. Tapping it opens a picker for color and style.
// Changes show everywhere at once (feed, comments, profiles), because they all use the same Avatar.
export default function AvatarEditor({ name, src, color, icon, size = 80 }) {
  const router = useRouter();
  const hasPhoto = !!src && !isDefaultPhoto(src);
  const [open, setOpen] = useState(false);
  const [c, setC] = useState(color || "brand");
  const [i, setI] = useState(icon || (hasPhoto ? "photo" : "initials"));
  const [hex, setHex] = useState(isHexColor(color) ? color : "");
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open]);

  function openPicker() {
    setC(color || "brand");
    setHex(isHexColor(color) ? color : "");
    setI(icon || (hasPhoto ? "photo" : "initials"));
    setError("");
    setOpen(true);
  }

  function save() {
    setError("");
    startTransition(async () => {
      const res = await updateAvatar(c, i);
      if (res?.error) return setError(res.error);
      showToast("Avatar updated", "success");
      setOpen(false);
      router.refresh();
    });
  }

  const custom = isHexColor(c);
  const tile = (active) =>
    `flex aspect-square w-full cursor-pointer items-center justify-center rounded-xl border transition-colors ${active ? "border-brand bg-brand-soft text-brand" : "border-line text-muted hover:border-brand hover:text-ink"}`;

  return (
    <>
      <button type="button" onClick={openPicker} aria-label="Change avatar" className="group relative block cursor-pointer rounded-[28%]">
        <Avatar name={name} src={src} color={color} icon={icon} size={size} />
        <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface text-muted shadow-sm transition-colors group-hover:text-brand">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16zM13.5 6.5l4 4" /></svg>
        </span>
      </button>

      {open && createPortal(
        <div className="modal-backdrop fixed inset-0 z-[70] flex items-end justify-center bg-black/50 backdrop-blur-[2px] sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && !pending && setOpen(false)}>
          <div role="dialog" aria-modal="true" aria-label="Change avatar" className="modal-panel flex max-h-[92vh] w-full flex-col overflow-y-auto rounded-t-3xl border border-line bg-surface p-5 shadow-2xl sm:max-w-md sm:rounded-3xl">
            <div className="flex items-center justify-between">
              <p className="font-display text-lg">Your avatar</p>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close" className="cursor-pointer rounded-full p-1.5 text-muted hover:bg-surface-2 hover:text-ink">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>

            <div className="my-5 flex justify-center">
              <Avatar name={name} src={src} color={c} icon={i} size={96} />
            </div>

            <fieldset>
              <legend className="text-xs font-semibold uppercase tracking-wide text-muted">Color</legend>
              <div className="mt-2 flex flex-wrap items-center gap-2.5">
                {AVATAR_COLORS.map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => setC(k)}
                    aria-label={k === "brand" ? "Buncho theme color" : k}
                    aria-pressed={c === k}
                    className={`h-9 w-9 cursor-pointer rounded-full border-2 transition-transform active:scale-90 ${c === k ? "border-ink" : "border-transparent"}`}
                    style={{ background: SWATCH[k] }}
                  />
                ))}

                {/* Any color: the round rainbow opens the device's color picker. */}
                <label
                  className={`relative h-9 w-9 cursor-pointer overflow-hidden rounded-full border-2 transition-transform active:scale-90 ${custom ? "border-ink" : "border-transparent"}`}
                  style={{ background: custom ? c : "conic-gradient(#f43f5e, #f59e0b, #10b981, #0ea5e9, #8b5cf6, #f43f5e)" }}
                  title="Pick any color"
                >
                  <input type="color" value={custom ? c : "#2347f5"} onChange={(e) => setC(e.target.value.toLowerCase())} aria-label="Pick any color" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
                </label>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-muted">Hex</span>
                <input
                  value={hex}
                  onChange={(e) => {
                    const v = e.target.value.trim();
                    setHex(v);
                    const withHash = v.startsWith("#") ? v : `#${v}`;
                    if (isHexColor(withHash)) setC(withHash.toLowerCase());
                  }}
                  placeholder="#7c3aed"
                  maxLength={7}
                  spellCheck={false}
                  autoCapitalize="none"
                  aria-label="Custom color hex code"
                  className="input !w-32 !py-1.5 font-mono"
                />
              </div>
              <p className="mt-1.5 text-xs text-muted">The first color follows your light or dark theme. Every color, including your own, adjusts to it automatically.</p>
            </fieldset>

            <fieldset className="mt-5">
              <legend className="text-xs font-semibold uppercase tracking-wide text-muted">Style</legend>
              <div className="mt-2 grid max-h-56 grid-cols-6 gap-2 overflow-y-auto pr-1">
                {hasPhoto && (
                  <button type="button" onClick={() => setI("photo")} aria-pressed={i === "photo"} aria-label="My photo" className={tile(i === "photo")}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 7h3l2-3h6l2 3h3v12H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" /></svg>
                  </button>
                )}
                {Object.entries(AVATAR_ICONS).map(([k, d]) => (
                  <button key={k} type="button" onClick={() => setI(k)} aria-pressed={i === k} aria-label={k === "initials" ? "My initials" : k} className={tile(i === k)}>
                    {d ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={d} /></svg>
                    ) : (
                      <span className="font-display text-sm">Aa</span>
                    )}
                  </button>
                ))}
              </div>
            </fieldset>

            {error && <p role="alert" className="mt-4 rounded-xl bg-danger-soft p-3 text-sm text-danger">{error}</p>}

            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setOpen(false)} disabled={pending} className="btn-outline !rounded-full">Cancel</button>
              <button type="button" onClick={save} disabled={pending} className="btn-primary !rounded-full">{pending ? "Saving" : "Save"}</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
// Avatar choices shared by the picker, the server action and the Avatar component.
// Colors are defined in globals.css (.av-<key>) and switch with the light/dark theme.
export const AVATAR_COLORS = ["brand", "coral", "amber", "emerald", "teal", "sky", "violet", "pink", "slate"];

// "initials" shows the person's letters; every other icon is a small drawing. "photo" uses their uploaded picture.
export const AVATAR_ICONS = {
  initials: null,
  smile: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 14c1 2 7 2 8 0M9 9.5h.01M15 9.5h.01",
  robot: "M12 3v3M6 6h12a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2zM9 12h.01M15 12h.01M9 16h6M2 12v2M22 12v2",
  ghost: "M5 21V10a7 7 0 0 1 14 0v11l-3-2-2 2-2-2-2 2-2-2zM9.5 10h.01M14.5 10h.01",
  cat: "M4 4l4 3h8l4-3v9a8 8 0 0 1-16 0zM9 12h.01M15 12h.01M10 16c1 1 3 1 4 0",
  paw: "M12 13c-3 0-5 2-5 4s2 3 5 3 5-1 5-3-2-4-5-4zM5 10h.01M9 6h.01M15 6h.01M19 10h.01",
  star: "M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z",
  heart: "M12 21s-7.5-4.6-9.5-9.2C1 8.4 3 5 6.4 5c2 0 3.6 1 4.6 2.6C12 6 13.6 5 15.6 5 19 5 21 8.4 19.5 11.8 19.5 11.8 12 21 12 21z",
  bolt: "M13 2L4 14h7l-1 8 9-12h-7z",
  flame: "M12 3c1 4 5 6 5 11a5 5 0 0 1-10 0c0-2 1-3 2-4 .5 2 1.5 2.5 2 2 1-2 0-5 1-9z",
  moon: "M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z",
  sun: "M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4",
  cloud: "M7 18a4 4 0 0 1-.5-8A6 6 0 0 1 18 9a4.5 4.5 0 0 1-.5 9z",
  leaf: "M5 19c0-8 5-14 15-14 0 10-6 15-14 15M5 19c2-5 5-8 9-10",
  mountain: "M3 20l6-11 4 7 2-3 6 7z",
  globe: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18",
  planet: "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM3.5 18C2 16 6 11 12 8.5M20.5 6C22 8 18 13 12 15.5",
  rocket: "M12 2c3 2 5 6 5 10l-2 3H9l-2-3c0-4 2-8 5-10zM9 15l-3 4 3-1M15 15l3 4-3-1M12 9h.01",
  code: "M8 8l-4 4 4 4M16 8l4 4-4 4M14 5l-4 14",
  terminal: "M4 5h16v14H4zM8 10l3 2-3 2M13 15h4",
  chip: "M7 7h10v10H7zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4",
  bulb: "M9 18h6M10 21h4M12 3a6 6 0 0 0-4 10c1 1 1 2 1 3h6c0-1 0-2 1-3a6 6 0 0 0-4-10z",
  flask: "M9 3h6M10 3v6l-5 9a2 2 0 0 0 2 3h10a2 2 0 0 0 2-3l-5-9V3M8 15h8",
  book: "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5",
  cap: "M2 9l10-5 10 5-10 5zM6 11.5V16c0 1.5 3 3 6 3s6-1.5 6-3v-4.5",
  target: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01",
  trophy: "M8 4h8v5a4 4 0 0 1-8 0zM8 6H4v2a3 3 0 0 0 4 3M16 6h4v2a3 3 0 0 1-4 3M12 13v4M8 21h8M10 17h4",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
  diamond: "M6 3h12l4 6-10 12L2 9z",
  crown: "M3 8l4 4 5-7 5 7 4-4-2 11H5z",
  camera: "M4 7h3l2-3h6l2 3h3v12H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  music: "M9 18V5l11-2v13M9 18a3 3 0 1 1-3-3 3 3 0 0 1 3 3zM20 16a3 3 0 1 1-3-3 3 3 0 0 1 3 3z",
  gamepad: "M6 8h12a4 4 0 0 1 4 4v3a3 3 0 0 1-5 2l-1-1H8l-1 1a3 3 0 0 1-5-2v-3a4 4 0 0 1 4-4zM7 11v3M5.5 12.5h3M16 12h.01M18 14h.01",
  coffee: "M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 10h2a2 2 0 0 1 0 4h-2M8 2v3M12 2v3",
};

// A color is one of the named ones above, or any "#rrggbb" the person picks.
export const isHexColor = (c) => typeof c === "string" && /^#[0-9a-fA-F]{6}$/.test(c);
export const isAvatarColor = (c) => AVATAR_COLORS.includes(c) || isHexColor(c);
export const isAvatarIcon = (i) => i === "photo" || Object.hasOwn(AVATAR_ICONS, i);

// Clerk gives every account a generated picture (a coloured letter) until the person uploads their own.
// Those would clash with Buncho's own avatars, so they are treated as "no photo".
export function isDefaultPhoto(url) {
  if (!url) return true;
  try {
    const u = new URL(url);
    if (!/(^|\.)clerk\.(com|dev)$/.test(u.hostname)) return false;
    const seg = decodeURIComponent(u.pathname.split("/").filter(Boolean).pop() || "");
    const json = JSON.parse(atob(seg.replace(/-/g, "+").replace(/_/g, "/")));
    return json?.type === "default";
  } catch {
    return false;
  }
}
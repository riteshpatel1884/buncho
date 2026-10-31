// Every profile gets its own colours, derived from the username, so no two pages look alike.
// Pure and dependency free: used by the page, the share image and the SVG badge.

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hslToHex(h, s, l) {
  const sat = s / 100;
  const lig = l / 100;
  const k = (n) => (n + h / 30) % 12;
  const a = sat * Math.min(lig, 1 - lig);
  const f = (n) => lig - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x) => Math.round(255 * x).toString(16).padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}

export function profileTheme(username = '') {
  const h = hash(String(username).toLowerCase());
  const hue = h % 360;
  const hue2 = (hue + 40 + (h % 70)) % 360;
  const hue3 = (hue2 + 55) % 360;
  return {
    hue,
    a: hslToHex(hue, 78, 52),
    b: hslToHex(hue2, 72, 44),
    c: hslToHex(hue3, 80, 60),
    dark: hslToHex(hue, 55, 12),
    // 3 soft blobs for the banner
    banner: `radial-gradient(60% 120% at 12% 0%, ${hslToHex(hue, 85, 58)} 0%, transparent 60%), radial-gradient(55% 110% at 88% 10%, ${hslToHex(hue2, 80, 52)} 0%, transparent 62%), radial-gradient(70% 120% at 55% 120%, ${hslToHex(hue3, 85, 62)} 0%, transparent 60%), linear-gradient(135deg, ${hslToHex(hue, 60, 22)}, ${hslToHex(hue2, 60, 18)})`,
  };
}
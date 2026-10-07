export function slugify(text) {
  return text.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 50);
}

export function isHttpUrl(value) {
  try {
    const u = new URL(value);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

// "react, SQL , python" -> ["react", "sql", "python"]
export function parseSkills(text, max = 15) {
  return [...new Set(String(text || "").split(",").map((s) => s.trim().toLowerCase()).filter((s) => s && s.length <= 30))].slice(0, max);
}

export function initials(name) {
  return (name || "?").split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

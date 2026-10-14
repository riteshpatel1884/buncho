const PATTERN = /^[a-z][a-z0-9_]{2,19}$/;
const RESERVED = new Set([
  "admin", "administrator", "buncho", "support", "help", "staff", "team", "official",
  "moderator", "mod", "root", "system", "null", "undefined", "api", "www",  "moderator", "mod", "root", "system", "null", "undefined", "api", "www",
  // Page addresses, so a profile at buncho.live/<username> never clashes with a real page.
  "feed", "experts", "projects", "dashboard", "onboarding", "book", "pay", "notifications",
  "privacy", "terms", "contact", "report", "community", "u", "sign", "signin", "signup",
]);

// "@Ritesh_01 " -> "ritesh_01"
export function cleanUsername(raw) {
  return String(raw ?? "").trim().toLowerCase().replace(/^@+/, "");
}

// Returns an error message, or null when the username is fine.
export function usernameError(u) {
  if (!u) return "Choose a username.";
  if (!PATTERN.test(u)) return "Username must be 3 to 20 characters: lowercase letters, numbers and underscores, starting with a letter.";
  if (RESERVED.has(u)) return "That username isn't available.";
  if (/\d{6,}/.test(u)) return "Please don't put a phone number in your username.";
  return null;
}
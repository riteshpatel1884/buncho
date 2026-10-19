/** Admins are listed by Clerk user ID in ADMIN_CLERK_IDS (comma separated). */
export function isAdmin(user) {
  if (!user) return false;
  const ids = (process.env.ADMIN_CLERK_IDS ?? '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return ids.includes(user.clerkId);
}
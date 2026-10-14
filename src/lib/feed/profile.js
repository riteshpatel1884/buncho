
import { prisma } from "@/lib/prisma";
import { getAdminUserIds } from "@/lib/user";

// Everything the public profile card needs for one person. Works for visitors who are not signed in.
// Returns null when the person should not be public: unknown id, or an expert who is not live yet
// (the expert themselves can still see it).
export async function getPublicProfile(userId, viewerId = null) {
  const u = await prisma.user.findUnique({
    where: { id: String(userId) },
    select: {
      id: true, name: true, avatarUrl: true, avatarColor: true, avatarIcon: true, username: true, role: true, blueTickUntil: true,
      expertProfile: { select: { slug: true, headline: true, jobTitle: true, company: true, college: true, status: true, educationVerified: true, employmentVerified: true, blueTickUntil: true } },
      studentProfile: { select: { college: true } },
    },
  }).catch(() => null);
  if (!u) return null;

  const adminIds = await getAdminUserIds().catch(() => []);
  const isAdmin = adminIds.includes(u.id);
  const e = u.expertProfile;
  const isMe = viewerId === u.id;

  if (!isAdmin) {
    if (e) { if (e.status !== "ACTIVE" && !isMe) return null; }
    else if (u.role !== "STUDENT") return null;
  }

  const [postCount, followingDb, followers, iFollow, adminProfile] = await Promise.all([
    prisma.post.count({ where: { authorId: u.id, hidden: false } }).catch(() => 0),
    prisma.follow.count({ where: { followerId: u.id, followingId: { notIn: adminIds } } }).catch(() => 0),
    // Everyone follows the Buncho team automatically, so its count is every registered person.
    isAdmin
      ? prisma.user.count({ where: { role: { not: null }, id: { notIn: adminIds } } }).catch(() => 0)
      : prisma.follow.count({ where: { followingId: u.id } }).catch(() => 0),
    viewerId && !isAdmin && !isMe
      ? prisma.follow.findUnique({ where: { followerId_followingId: { followerId: viewerId, followingId: u.id } }, select: { followerId: true } }).catch(() => null)
      : null,
    isAdmin ? prisma.adminProfile.findUnique({ where: { userId: u.id }, select: { headline: true } }).catch(() => null) : null,
  ]);

  const tickUntil = e ? e.blueTickUntil : u.blueTickUntil;
  const college = e?.college ?? u.studentProfile?.college ?? null;
  const roleLine = isAdmin
    ? "Official Buncho Team"
    : e?.jobTitle && e?.company
      ? `${e.jobTitle} at ${e.company}`
      : u.role === "STUDENT"
        ? college ? `Student, ${college}` : "Student"
        : "Expert";

  return {
    id: u.id,
    name: u.name,
    username: u.username,
    avatarUrl: u.avatarUrl,
    avatarColor: u.avatarColor,
    avatarIcon: u.avatarIcon,
    isAdmin,
    isMe,
    slug: isAdmin ? null : e?.slug ?? null,
    roleLine,
    headline: isAdmin ? adminProfile?.headline ?? null : e?.headline ?? null,
    verified: !isAdmin && !!(e?.educationVerified || e?.employmentVerified),
    blueTick: !isAdmin && !!tickUntil && tickUntil > new Date(),
    postCount,
    followers,
    // Same rule as the feed: the Buncho team counts as followed by everyone.
    followingCount: followingDb + adminIds.filter((x) => x !== u.id).length,
    viewerFollows: !!iFollow,
  };
}

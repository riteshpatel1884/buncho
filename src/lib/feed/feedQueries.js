import { prisma } from "@/lib/prisma";
import { getAdminUserIds } from "@/lib/user";
import { PAGE_SIZE, TOPICS, SORTS } from "@/lib/feed/feed";

// Latest (default), oldest, or most popular (likes, then comments). The id keeps the order stable for paging.
function orderFor(sort) {
  if (!Object.hasOwn(SORTS, sort)) sort = "latest";
  if (sort === "oldest") return [{ createdAt: "asc" }, { id: "asc" }];
  if (sort === "popular") return [{ likes: { _count: "desc" } }, { comments: { _count: "desc" } }, { createdAt: "desc" }, { id: "desc" }];
  return [{ createdAt: "desc" }, { id: "desc" }];
}

// One page of posts, shaped for the client.
// Shown: posts by live experts, posts by normal users (students), and posts by the admin
// (everyone "follows" the admin automatically).
export async function getPosts({ viewerId = null, cursor = null, topic = "", college = "", tab = "for-you", sort = "latest", postId = null, authorId = null } = {}) {
  const adminIds = await getAdminUserIds();
  const adminSet = new Set(adminIds);

  const where = { hidden: false };
  const and = [];

  if (authorId) {
    // An author's own list ("My posts"): show everything they posted, whatever their profile status.
    where.authorId = authorId;
  } else {
    const profile = { status: "ACTIVE", ...(college ? { college: { contains: college, mode: "insensitive" } } : {}) };
    const studentCollege = college ? { studentProfile: { college: { contains: college, mode: "insensitive" } } } : {};
    // The admin has no college, so admin posts are left out while a college filter is on.
    and.push({
      OR: [
        { author: { expertProfile: profile } },
        { author: { role: "STUDENT", ...studentCollege } },
        ...(college ? [] : [{ authorId: { in: adminIds } }]),
      ],
    });
    if (viewerId && tab === "following") {
      // Everyone follows the admin without clicking anything.
      and.push({ OR: [{ author: { followers: { some: { followerId: viewerId } } } }, { authorId: { in: adminIds } }] });
    }
  }
  if (and.length) where.AND = and;
  if (postId) where.id = postId;
  if (Object.hasOwn(TOPICS, topic)) where.topic = topic;
  if (viewerId && tab === "saved") where.saves = { some: { userId: viewerId } };

  const rows = await prisma.post.findMany({
    where,
    orderBy: orderFor(sort),
    take: PAGE_SIZE + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      author: {
        select: {
          id: true, name: true, avatarUrl: true, avatarColor: true, avatarIcon: true, username: true, role: true, blueTickUntil: true,
          expertProfile: { select: { slug: true, jobTitle: true, company: true, college: true, educationVerified: true, employmentVerified: true, blueTickUntil: true } },
          studentProfile: { select: { college: true } },
        },
      },
      service: { select: { id: true, title: true, priceInr: true, active: true } },
      _count: { select: { likes: true, comments: true, views: true } },
      ...(viewerId
        ? { likes: { where: { userId: viewerId }, select: { userId: true } }, saves: { where: { userId: viewerId }, select: { userId: true } } }
        : {}),
    },
  });

  const page = rows.slice(0, PAGE_SIZE);
  const nextCursor = rows.length > PAGE_SIZE ? page[page.length - 1].id : null;

  // How many people follow each author on this page.
  const authorIds = [...new Set(page.map((p) => p.authorId))];
  const expertAuthorIds = authorIds.filter((id) => !adminSet.has(id));
  const counts = new Map();
  if (expertAuthorIds.length) {
    const grouped = await prisma.follow.groupBy({ by: ["followingId"], where: { followingId: { in: expertAuthorIds } }, _count: { _all: true } });
    grouped.forEach((g) => counts.set(g.followingId, g._count._all));
  }
  // The admin's followers are everyone registered (experts and students), so nobody has to follow.
  if (authorIds.some((id) => adminSet.has(id))) {
    const everyone = await prisma.user.count({ where: { role: { not: null }, id: { notIn: adminIds } } });
    adminIds.forEach((id) => counts.set(id, everyone));
  }

  let followed = new Set(adminIds);
  if (viewerId && expertAuthorIds.length) {
    const f = await prisma.follow.findMany({
      where: { followerId: viewerId, followingId: { in: expertAuthorIds } },
      select: { followingId: true },
    });
    followed = new Set([...adminIds, ...f.map((x) => x.followingId)]);
  }

  const posts = page.map((p) => {
    const e = p.author.expertProfile;
    const admin = adminSet.has(p.authorId);
    // The tick is on the expert profile for experts, and on the account for everyone else.
    const tickUntil = e ? e.blueTickUntil : p.author.blueTickUntil;
    return {
      id: p.id,
      body: p.body,
      topic: p.topic,
      createdAt: p.createdAt.toISOString(),
      author: {
        id: p.author.id,
        name: p.author.name,
        avatarUrl: p.author.avatarUrl,
        avatarColor: p.author.avatarColor,
        avatarIcon: p.author.avatarIcon,
        username: p.author.username,
        role: p.author.role,
        isAdmin: admin,
        slug: admin ? null : e?.slug ?? null,
        jobTitle: admin ? null : e?.jobTitle ?? null,
        company: admin ? null : e?.company ?? null,
        college: admin ? null : e?.college ?? p.author.studentProfile?.college ?? null,
        followers: counts.get(p.authorId) ?? 0,
        verified: admin ? false : !!(e?.educationVerified || e?.employmentVerified),
        blueTick: admin ? false : !!tickUntil && tickUntil > new Date(),
      },
      service: p.service && p.service.active ? { id: p.service.id, title: p.service.title, priceInr: p.service.priceInr } : null,
      views: p._count.views,
      likes: p._count.likes,
      comments: p._count.comments,
      liked: !!p.likes?.length,
      saved: !!p.saves?.length,
      following: followed.has(p.authorId),
      mine: viewerId === p.authorId,
      viewerIsAdmin: viewerId ? adminSet.has(viewerId) : false,
    };
  });

  return { posts, nextCursor };
}
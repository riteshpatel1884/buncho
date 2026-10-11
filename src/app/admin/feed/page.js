import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, isAdmin, getAdminUserIds } from "@/lib/user";
import { findContactInfo } from "@/lib/contactCheck";
import { TOPICS, timeAgo } from "@/lib/feed/feed";
import PostComposer from "@/components/feed/PostComposer";
import DeleteButton from "@/components/admin/feed/DeleteButton";
import { adminDeletePost, adminDeleteComment } from "./actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin feed | buncho" };

const TABS = [["admin", "Admin posts"], ["experts", "Expert posts"], ["replies", "Replies"]];
const STEP = 30;

const POST_SELECT = {
  id: true,
  body: true,
  topic: true,
  hidden: true,
  createdAt: true,
  author: { select: { name: true, username: true } },
  _count: { select: { likes: true, comments: true } },
};

function PostRow({ p }) {
  return (
    <li className="card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-semibold">
            {p.author.name || "Unknown"}
            {p.author.username && <span className="ml-1.5 text-sm font-normal text-muted">@{p.author.username}</span>}
          </p>
          <p className="text-xs text-muted">{timeAgo(p.createdAt)} · {p._count.likes} likes · {p._count.comments} replies{p.hidden ? " · hidden" : ""}</p>
        </div>
        <span className="chip">{TOPICS[p.topic] ?? p.topic}</span>
      </div>
      <p className="mt-3 whitespace-pre-line break-words text-sm leading-relaxed">{p.body}</p>
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-line pt-3">
        <Link href={`/feed/${p.id}`} className="text-sm font-medium text-brand hover:underline">Open post</Link>
        <form action={adminDeletePost}>
          <input type="hidden" name="id" value={p.id} />
          <DeleteButton message="Delete this post and all its replies? This can't be undone." />
        </form>
      </div>
    </li>
  );
}

function ReplyRow({ c, post }) {
  const flags = findContactInfo(c.body);
  const role = c.user.role === "EXPERT" ? "Expert" : c.user.role === "STUDENT" ? "Student" : "User";
  return (
    <li className="card p-5">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <b>{c.user.name || "Someone"}</b>
        {c.user.username && <span className="text-muted">@{c.user.username}</span>}
        <span className="chip">{role}</span>
        <span className="text-xs text-muted">{timeAgo(c.createdAt)}</span>
      </div>
      <p className="mt-2 whitespace-pre-line break-words">{c.body}</p>
      {flags.length > 0 && (
        <p className="mt-2 rounded-lg bg-warn-soft px-3 py-2 text-xs font-medium text-warn">Possible contact info: {flags.join(", ")}</p>
      )}

      {/* The post this reply was written on, so you don't have to search for it. */}
      <div className="mt-3 rounded-xl bg-surface-2 p-3">
        {post ? (
          <>
            <p className="text-xs text-muted">Reply on a post by <b className="text-ink">{post.author.name || "Unknown"}</b> · {timeAgo(post.createdAt)}</p>
            <p className="mt-1 line-clamp-3 whitespace-pre-line break-words text-sm">{post.body}</p>
            <Link href={`/feed/${post.id}`} className="mt-1.5 inline-block text-xs font-medium text-brand hover:underline">Open post</Link>
          </>
        ) : (
          <p className="text-sm text-muted">This post no longer exists.</p>
        )}
      </div>

      <div className="mt-4 flex justify-end border-t border-line pt-3">
        <form action={adminDeleteComment}>
          <input type="hidden" name="id" value={c.id} />
          <DeleteButton label="Delete reply" message="Delete this reply? This can't be undone." />
        </form>
      </div>
    </li>
  );
}

export default async function AdminFeed({ searchParams }) {
  await requireUser("/admin/feed");
  if (!(await isAdmin())) notFound();

  const sp = await searchParams;
  const tab = TABS.some(([k]) => k === sp.tab) ? sp.tab : "admin";
  const n = Math.min(Math.max(Number.parseInt(sp.n, 10) || STEP, STEP), 300);
  const adminIds = await getAdminUserIds();

  const adminWhere = { authorId: { in: adminIds } };
  const expertWhere = { authorId: { notIn: adminIds } };

  const [adminCount, expertCount, replyCount] = await Promise.all([
    prisma.post.count({ where: adminWhere }),
    prisma.post.count({ where: expertWhere }),
    prisma.postComment.count(),
  ]);
  const counts = { admin: adminCount, experts: expertCount, replies: replyCount };

  let rows = [];
  let postsById = new Map();

  if (tab === "replies") {
    rows = await prisma.postComment.findMany({
      orderBy: { createdAt: "desc" },
      take: n + 1,
      include: { user: { select: { name: true, username: true, role: true } } },
    });
    const postIds = [...new Set(rows.slice(0, n).map((c) => c.postId))];
    const posts = postIds.length
      ? await prisma.post.findMany({ where: { id: { in: postIds } }, select: { id: true, body: true, createdAt: true, author: { select: { name: true } } } })
      : [];
    postsById = new Map(posts.map((p) => [p.id, p]));
  } else {
    rows = await prisma.post.findMany({
      where: tab === "admin" ? adminWhere : expertWhere,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: n + 1,
      select: POST_SELECT,
    });
  }

  const hasMore = rows.length > n;
  const shown = rows.slice(0, n);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/admin" className="text-sm font-medium text-muted hover:text-ink">Back to admin</Link>
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Feed</h1>
        <p className="mt-1 text-muted">Post as Buncho, and remove any post or reply that breaks the rules.</p>
      </div>

      <div className="flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map(([k, label]) => (
          <Link
            key={k}
            href={`/admin/feed?tab=${k}`}
            className={`-mb-px shrink-0 border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${tab === k ? "border-brand text-brand" : "border-transparent text-muted hover:text-ink"}`}
          >
            {label} <span className="ml-1 rounded-full bg-surface-2 px-2 py-0.5 text-xs text-muted">{counts[k]}</span>
          </Link>
        ))}
      </div>

      {tab === "admin" && <PostComposer />}

      {shown.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line p-10 text-center text-muted">
          {tab === "admin" ? "You haven't posted yet." : tab === "experts" ? "No expert posts yet." : "No replies yet."}
        </div>
      ) : (
        <ul className="space-y-4">
          {tab === "replies"
            ? shown.map((c) => <ReplyRow key={c.id} c={c} post={postsById.get(c.postId)} />)
            : shown.map((p) => <PostRow key={p.id} p={p} />)}
        </ul>
      )}

      {hasMore && (
        <div className="flex justify-center">
          <Link href={`/admin/feed?tab=${tab}&n=${n + STEP}`} className="btn-outline">Show more</Link>
        </div>
      )}
    </div>
  );
}
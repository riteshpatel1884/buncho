import Link from "next/link";
import { prisma } from "@/lib/prisma";
import PollCard from "@/components/poll-card";
import { btnGhost, btnPrimary, card, inputCls } from "@/components/ui";
import { POLL_TYPES } from "@/lib/poll-utils";

export const dynamic = "force-dynamic";
export const metadata = { title: "Before It Happens" };

const val = (v) => (Array.isArray(v) ? v[0] : v) || "";

export default async function PollsPage({ searchParams }) {
  const sp = await searchParams;
  const q = val(sp.q).trim();
  const type = val(sp.type);
  const status = val(sp.status);
  const tag = val(sp.tag);
  const now = new Date();

  const where = {
    ...(q && { question: { contains: q, mode: "insensitive" } }),
    ...(POLL_TYPES[type] && { type }),
    ...(tag && { tags: { some: { slug: tag } } }),
    ...(status === "open" && { status: "OPEN", closesAt: { gt: now } }),
    ...(status === "closed" && { status: "OPEN", closesAt: { lte: now } }),
    ...(status === "resolved" && { status: "RESOLVED" }),
  };

  const [polls, tags] = await Promise.all([
    prisma.poll.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 30,
      include: { author: { select: { username: true } }, tags: true, _count: { select: { votes: true } } },
    }),
    prisma.tag.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Before It Happens</h1>
          <p className="text-sm text-muted">Polls, predictions and crowd questions.</p>
        </div>
        <Link href="/polls/new" className={btnPrimary}>New poll</Link>
      </div>

      <form className={`${card} grid gap-3 p-4 sm:grid-cols-5`}>
        <input name="q" defaultValue={q} placeholder="Search polls…" className={`${inputCls} sm:col-span-2`} />
        <select name="type" defaultValue={type} className={inputCls}>
          <option value="">All types</option>
          {Object.entries(POLL_TYPES).map(([k, t]) => <option key={k} value={k}>{t.label}</option>)}
        </select>
        <select name="status" defaultValue={status} className={inputCls}>
          <option value="">Any status</option>
          <option value="open">Open</option>
          <option value="closed">Closed</option>
          <option value="resolved">Resolved</option>
        </select>
        <select name="tag" defaultValue={tag} className={inputCls}>
          <option value="">All tags</option>
          {tags.map((t) => <option key={t.id} value={t.slug}>{t.name}</option>)}
        </select>
        <div className="flex gap-2 sm:col-span-5">
          <button className={btnPrimary}>Apply</button>
          <Link href="/polls" className={btnGhost}>Reset</Link>
        </div>
      </form>

      {polls.length ? (
        <div className="grid gap-4 sm:grid-cols-2">{polls.map((p) => <PollCard key={p.id} poll={p} />)}</div>
      ) : (
        <div className={`${card} p-10 text-center text-sm text-muted`}>No polls match your filters.</div>
      )}
    </div>
  );
}
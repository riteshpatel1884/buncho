import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, isAdmin } from "@/lib/user";
import { SERVICE_TYPES } from "@/lib/constants";
import { budgetLabel, days } from "@/lib/projects";
import { timeAgo } from "@/lib/feed/feed";
import { ProjectStatusBadge, ProposalStatusBadge } from "@/components/projects/ProjectStatusBadge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Projects | buncho" };

export default async function ProjectsPage({ searchParams }) {
  const sp = await searchParams;
  const user = await requireUser("/projects");
  if (!user.role) redirect((await isAdmin()) ? "/admin/projects" : "/onboarding");
  const type = Object.hasOwn(SERVICE_TYPES, sp.type) ? sp.type : "";
  return user.role === "STUDENT" ? <StudentView user={user} /> : <ExpertView user={user} type={type} />;
}

async function StudentView({ user }) {
  const projects = await prisma.project.findMany({ where: { studentId: user.id }, orderBy: { createdAt: "desc" }, take: 50 });
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl">Your projects</h1>
          <p className="mt-1 text-muted">Post what you need and your budget. Pay only after you agree a price with an expert.</p>
        </div>
        <Link href="/projects/new" className="btn-primary">Post a project</Link>
      </div>
      {projects.length === 0 ? (
        <div className="rounded-xl border border-dashed border-line p-10 text-center">
          <p className="font-display text-xl">No projects yet.</p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted">Describe the help you need and set a budget range. Experts will send you proposals.</p>
          <Link href="/projects/new" className="btn-primary mt-5">Post your first project</Link>
        </div>
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => (
            <li key={p.id}>
              <Link href={`/projects/${p.id}`} className="card card-hover flex flex-wrap items-center justify-between gap-3 p-5">
                <div className="min-w-0">
                  <p className="truncate font-semibold">{p.title}</p>
                  <p className="text-sm text-muted">{SERVICE_TYPES[p.helpType]} · {budgetLabel(p)} · {days(p.deadlineDays)} · {timeAgo(p.createdAt.toISOString())}</p>
                </div>
                <ProjectStatusBadge status={p.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

async function ExpertView({ user, type }) {
  const expert = await prisma.expertProfile.findUnique({ where: { userId: user.id }, select: { id: true, status: true } });
  const [open, mine] = await Promise.all([
    prisma.project.findMany({
      where: { status: "OPEN", ...(type ? { helpType: type } : {}) },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: { student: { select: { name: true } } },
    }),
    expert
      ? prisma.projectProposal.findMany({ where: { expertId: expert.id }, orderBy: { updatedAt: "desc" }, take: 30, include: { project: { select: { id: true, title: true } } } })
      : [],
  ]);
  const proposed = new Set(mine.map((m) => m.projectId));
  const chip = (active) => `shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium ${active ? "border-brand bg-brand-soft text-brand" : "border-line bg-surface"}`;

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Projects</h1>
        <p className="mt-1 text-muted">Students post what they need and their budget. Send an offer or ask a question.</p>
      </div>
      {expert?.status !== "ACTIVE" && <p className="rounded-xl bg-warn-soft p-4 text-sm text-warn">You can send proposals once your profile is approved and live.</p>}

      {mine.length > 0 && (
        <section className="space-y-3">
          <h2 className="font-display text-xl">Your proposals</h2>
          <ul className="space-y-2">
            {mine.map((m) => (
              <li key={m.id}>
                <Link href={`/projects/${m.projectId}/p/${m.id}`} className="card card-hover flex items-center justify-between gap-3 p-4">
                  <span className="min-w-0 truncate font-medium">{m.project.title}</span>
                  <ProposalStatusBadge status={m.status} />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="font-display text-xl">Open projects</h2>
        <div className="no-scrollbar flex gap-2 overflow-x-auto">
          <Link href="/projects" className={chip(!type)}>All</Link>
          {Object.entries(SERVICE_TYPES).map(([k, v]) => <Link key={k} href={`/projects?type=${k}`} className={chip(type === k)}>{v}</Link>)}
        </div>
        {open.length === 0 ? (
          <p className="rounded-xl border border-dashed border-line p-8 text-center text-muted">No open projects right now. Check back soon.</p>
        ) : (
          <ul className="space-y-3">
            {open.map((p) => (
              <li key={p.id}>
                <Link href={`/projects/${p.id}`} className="card card-hover block p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <p className="min-w-0 font-semibold">{p.title}</p>
                    <span className="font-display text-xl">{budgetLabel(p)}</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-muted">{p.description}</p>
                  <p className="mt-3 text-xs text-muted">
                    <span className="chip mr-2">{SERVICE_TYPES[p.helpType]}</span>
                    {days(p.deadlineDays)} · {p.student.name || "A student"} · {timeAgo(p.createdAt.toISOString())}
                    {proposed.has(p.id) && " · You sent a proposal"}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
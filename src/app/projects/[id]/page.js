import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, isAdmin } from "@/lib/user";
import { SERVICE_TYPES, inr } from "@/lib/constants";
import { budgetLabel, days } from "@/lib/projects";
import { closeProject } from "../actions";
import DeleteButton from "@/components/admin/feed/DeleteButton";
import { ProposalForm } from "@/components/projects/ThreadForms";
import { ProjectStatusBadge, ProposalStatusBadge } from "@/components/projects/ProjectStatusBadge";

export const dynamic = "force-dynamic";
export const metadata = { title: "Project | buncho" };

export default async function ProjectPage({ params, searchParams }) {
  const { id } = await params;
  const sp = await searchParams;
  const user = await requireUser(`/projects/${id}`);
  const admin = await isAdmin();

  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      student: { select: { name: true } },
      proposals: {
        orderBy: { createdAt: "asc" },
        include: {
          expert: { select: { userId: true, user: { select: { name: true } } } },
          messages: { where: { reviewStatus: "APPROVED" }, orderBy: { createdAt: "desc" } },
        },
      },
    },
  });
  if (!project) notFound();

  const isOwner = project.studentId === user.id;
  const expert = user.role === "EXPERT" ? await prisma.expertProfile.findUnique({ where: { userId: user.id }, select: { id: true, status: true } }) : null;
  const mine = expert ? project.proposals.find((p) => p.expertId === expert.id) : null;
  if (!isOwner && !admin && !mine && project.status !== "OPEN") notFound();
  if (!isOwner && !admin && !mine && !expert) notFound();

  // The student only sees proposals once Buncho has approved the expert's first message.
  const visible = project.proposals
    .map((p) => ({ ...p, latestOffer: p.messages.find((m) => m.kind === "OFFER") ?? null, seen: p.messages.some((m) => m.authorId === p.expert.userId) }))
    .filter((p) => p.seen);
  const canClose = isOwner && ["PENDING_REVIEW", "OPEN"].includes(project.status);
  const canPropose = !isOwner && !mine && expert?.status === "ACTIVE" && project.status === "OPEN";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link href="/projects" className="text-sm font-medium text-muted hover:text-ink">Back to projects</Link>
      {sp.posted && <p role="status" className="rounded-xl bg-brand-soft p-4 text-sm font-medium text-brand">Sent to Buncho for review. Experts see it once it is approved. You'll get an email.</p>}
      {isOwner && project.status === "REJECTED" && <p role="alert" className="rounded-xl bg-danger-soft p-4 text-sm text-danger">Not published: {project.reviewNote}</p>}

      <header className="card space-y-4 p-5 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="chip">{SERVICE_TYPES[project.helpType]}</span>
            <h1 className="mt-2 font-display text-2xl sm:text-3xl">{project.title}</h1>
            <p className="mt-1 text-sm text-muted">Posted by {project.student.name || "a student"}</p>
          </div>
          <ProjectStatusBadge status={project.status} />
        </div>
        <dl className="grid grid-cols-2 gap-4 border-t border-line pt-4 text-sm">
          <div><dt className="text-xs text-muted">Budget</dt><dd className="font-display text-xl">{budgetLabel(project)}</dd></div>
          <div><dt className="text-xs text-muted">Deadline</dt><dd className="font-display text-xl">{days(project.deadlineDays)}</dd></div>
        </dl>
        <p className="whitespace-pre-line break-words leading-relaxed">{project.description}</p>
        <div>
          <p className="text-sm font-medium">What they want to get</p>
          <ul className="mt-1.5 space-y-1 text-sm">
            {project.deliverables.map((d) => <li key={d} className="flex gap-2"><span className="text-brand">✓</span>{d}</li>)}
          </ul>
        </div>
        {canClose && (
          <form action={closeProject} className="border-t border-line pt-4">
            <input type="hidden" name="id" value={project.id} />
            <DeleteButton label="Close project" message="Close this project? Experts will no longer see it." />
          </form>
        )}
      </header>

      {mine && (
        <Link href={`/projects/${project.id}/p/${mine.id}`} className="card card-hover flex items-center justify-between gap-3 p-5">
          <span className="font-semibold">Your conversation about this project</span>
          <ProposalStatusBadge status={mine.status} />
        </Link>
      )}
      {canPropose && <ProposalForm projectId={project.id} defaultPrice={project.budgetMaxInr} />}

      {(isOwner || admin) && (
        <section className="space-y-3">
          <h2 className="font-display text-xl">Proposals</h2>
          {visible.length === 0 ? (
            <p className="rounded-xl border border-dashed border-line p-8 text-center text-muted">
              {project.status === "OPEN" ? "No proposals yet. Experts will write to you here." : "No proposals to show."}
            </p>
          ) : (
            <ul className="space-y-3">
              {visible.map((p) => (
                <li key={p.id}>
                  <Link href={`/projects/${project.id}/p/${p.id}`} className="card card-hover flex flex-wrap items-center justify-between gap-3 p-5">
                    <div className="min-w-0">
                      <p className="font-semibold">{p.expert.user.name || "Expert"}</p>
                      <p className="text-sm text-muted">{p.agreedPriceInr ? `Agreed ${inr(p.agreedPriceInr)}` : p.latestOffer ? `Latest offer ${inr(p.latestOffer.priceInr)} in ${days(p.latestOffer.deliveryDays)}` : "Asked a question"}</p>
                    </div>
                    <ProposalStatusBadge status={p.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
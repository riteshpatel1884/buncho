import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDbUser, isAdmin } from "@/lib/user";
import Avatar from "@/components/Avatar";
import VerificationBadges, { BlueTick, isBlueTick } from "@/components/Badges";
import StatusBadge from "@/components/StatusBadge";
import { SERVICE_TYPES, WEEKDAYS, fmtMinutes, inr } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const e = await prisma.expertProfile.findFirst({ where: { slug, status: "ACTIVE" }, select: { jobTitle: true, company: true, user: { select: { name: true } } } });
  return e ? { title: `${e.user.name}, ${e.jobTitle} at ${e.company} | buncho` } : {};
}

export default async function ExpertPage({ params }) {
  const { slug } = await params;
  const expert = await prisma.expertProfile.findUnique({
    where: { slug },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true } },
      services: { where: { active: true }, orderBy: { priceInr: "asc" } },
      availability: { orderBy: [{ weekday: "asc" }, { startMin: "asc" }] },
    },
  });
  if (!expert) notFound();

  const [me, admin] = await Promise.all([getDbUser(), isAdmin()]);
  const isOwner = me?.id === expert.user.id;
  if (expert.status !== "ACTIVE" && !isOwner && !admin) notFound();

  const canBook = expert.status === "ACTIVE" && !isOwner && me?.role !== "EXPERT";

  return (
    <article className="space-y-8">
      <Link href="/experts" className="text-sm font-medium text-muted hover:text-ink">Back to experts</Link>

      {expert.status !== "ACTIVE" && (
        <p className="rounded-xl bg-warn-soft p-4 text-sm text-warn">
          This profile is {expert.status === "PENDING" ? "under review" : "suspended"} and only you and the Buncho team can see it.
        </p>
      )}

      <header className="card rise flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:p-8">
        <Avatar name={expert.user.name} src={expert.user.avatarUrl} size={96} />
        <div className="min-w-0 flex-1 space-y-2">
          <h1 className="flex items-center gap-2 font-display text-2xl font-bold leading-tight sm:text-3xl">
            <span className="min-w-0 break-words">{expert.user.name}</span>
            {isBlueTick(expert) && <BlueTick className="h-6 w-6 shrink-0 sm:h-7 sm:w-7" />}
          </h1>
          {expert.headline && <p className="text-muted sm:text-lg">{expert.headline}</p>}
          <p className="text-sm">{expert.jobTitle} at {expert.company}, {expert.experienceYears} {expert.experienceYears === 1 ? "year" : "years"} of experience</p>
          <p className="text-sm text-muted">{expert.college}, {expert.branch}, class of {expert.graduationYear}</p>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <VerificationBadges expert={expert} showEmpty />
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <section className="card reveal p-5 sm:p-8">
            <h2 className="font-display text-xl font-bold">About</h2>
            <p className="mt-3 max-w-2xl whitespace-pre-line leading-relaxed">{expert.bio}</p>
            {expert.skills.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">{expert.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>
            )}
            <div className="mt-5 flex flex-wrap gap-3 text-sm">
              <a href={expert.linkedinUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline">LinkedIn</a>
              {expert.githubUrl && <a href={expert.githubUrl} target="_blank" rel="noopener noreferrer" className="font-medium text-brand hover:underline">GitHub</a>}
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="font-display text-xl font-bold">Services</h2>
            {expert.services.length === 0 ? (
              <div className="card border-dashed p-8 text-center text-muted">No services listed yet.</div>
            ) : (
              <ul className="space-y-4">
                {expert.services.map((s, i) => (
                  <li key={s.id} className="card card-hover rise p-5" style={{ "--i": i }}>
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <span className="chip">{SERVICE_TYPES[s.type]}</span>
                        <h3 className="mt-2 font-display text-lg font-semibold">{s.title}</h3>
                        <p className="mt-1 text-sm text-muted">{s.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-display text-2xl font-bold">{inr(s.priceInr)}</p>
                        <p className="text-xs text-muted">{s.durationMin} min</p>
                      </div>
                    </div>
                    {s.deliverables.length > 0 && (
                      <ul className="mt-3 space-y-1 text-sm">
                        {s.deliverables.map((d) => <li key={d} className="flex gap-2"><span className="text-brand">✓</span>{d}</li>)}
                      </ul>
                    )}
                    {canBook ? (
                      <Link href={`/book/${s.id}`} className="btn-primary mt-4">Book this</Link>
                    ) : (
                      !isOwner && me?.role === "EXPERT" && <p className="mt-4 text-xs text-muted">Booking is for student accounts.</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-5">
          <div className="card p-5">
            <h3 className="font-display text-lg font-bold">Usually available</h3>
            {expert.availability.length === 0 ? (
              <p className="mt-2 text-sm text-muted">No times set yet.</p>
            ) : (
              <ul className="mt-3 space-y-2 text-sm">
                {expert.availability.map((a) => (
                  <li key={a.id} className="flex justify-between gap-3">
                    <span className="text-muted">{WEEKDAYS[a.weekday]}</span>
                    <span className="font-medium">{fmtMinutes(a.startMin)} to {fmtMinutes(a.endMin)}</span>
                  </li>
                ))}
              </ul>
            )}
            <p className="mt-3 text-xs text-muted">Times are in India time (IST).</p>
          </div>
          {isOwner && (
            <div className="card flex items-center justify-between gap-3 p-5">
              <StatusBadge status={expert.status === "PENDING" ? "REVIEW" : expert.status} />
              <Link href="/dashboard/profile" className="text-sm font-medium text-brand hover:underline">Edit profile</Link>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
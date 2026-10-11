import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDbUser, isAdmin } from "@/lib/user";
import Avatar from "@/components/Avatar";
import VerificationBadges, { BlueTick, isBlueTick, NotVerified } from "@/components/Badges";
import StatusBadge from "@/components/StatusBadge";
import ReportButton from "@/components/ReportButton";
import { FIELD_LABELS } from "@/lib/review";
import { SERVICE_TYPES, inr } from "@/lib/constants";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const e = await prisma.expertProfile.findFirst({ where: { slug, status: "ACTIVE" }, select: { jobTitle: true, company: true, user: { select: { name: true } } } });
  return e ? { title: `${e.user.name}, ${e.jobTitle} at ${e.company} | buncho` } : {};
}

function Fact({ label, children }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="mt-0.5 truncate text-sm font-semibold">{children}</dd>
    </div>
  );
}

function Check({ ok }) {
  return ok ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-mint-soft px-2.5 py-0.5 text-xs font-semibold text-mint">✓ Verified by Buncho</span>
  ) : (
    <span className="rounded-full bg-warn-soft px-2.5 py-0.5 text-xs font-semibold text-warn">Not verified yet</span>
  );
}

export default async function ExpertPage({ params }) {
  const { slug } = await params;
  const expert = await prisma.expertProfile.findUnique({
    where: { slug },
    include: {
      user: { select: { id: true, name: true, avatarUrl: true, username: true } },
      services: { where: { active: true }, orderBy: { priceInr: "asc" } },
    },
  });
  if (!expert) notFound();

  const [me, admin] = await Promise.all([getDbUser(), isAdmin()]);
  const isOwner = me?.id === expert.user.id;
  if (expert.status !== "ACTIVE" && !isOwner && !admin) notFound();

  const canBook = expert.status === "ACTIVE" && !isOwner && me?.role !== "EXPERT";
  const unv = (f) => expert.unverifiedFields?.includes(f);
  const from = expert.services.length ? Math.min(...expert.services.map((s) => s.priceInr)) : null;
  const years = `${expert.experienceYears} ${expert.experienceYears === 1 ? "year" : "years"}`;
  const gradText = expert.graduationYear > new Date().getFullYear() ? "graduating in" : "graduated in";

  // Buncho checks the expert's profiles itself, so the links are never shown to students.
  const checked = expert.educationVerified || expert.employmentVerified;
  const linkedinOk = checked && !unv("linkedin");
  const githubOk = checked && !unv("github");

  return (
    <article className="space-y-8">
      {me?.role !== "EXPERT" && (
        <Link href="/experts" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-brand">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6" /></svg>
          All experts
        </Link>
      )}

      {expert.status !== "ACTIVE" && (
        <p className="rounded-xl bg-warn-soft p-4 text-sm text-warn">
          This profile is {expert.status === "PENDING" ? "under review" : "suspended"} and only you and the Buncho team can see it.
        </p>
      )}

      {isOwner && expert.unverifiedFields?.length > 0 && (
        <p className="rounded-xl bg-warn-soft p-4 text-sm text-warn">
          You changed your {expert.unverifiedFields.map((f) => FIELD_LABELS[f]).join(", ")}. Students see these as "Not verified" until the Buncho team checks them again.
        </p>
      )}

      {/* Identity card: banner, overlapping avatar, key facts */}
      <header className="card overflow-hidden">
        <div
          className="h-28 bg-navy sm:h-36"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, color-mix(in srgb, var(--on-navy) 22%, transparent) 1px, transparent 0)", backgroundSize: "18px 18px" }}
          aria-hidden="true"
        />
        <div className="px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="-mt-14 flex flex-wrap items-end justify-between gap-4 sm:-mt-16">
            <div className="rounded-[28%] bg-surface p-1.5">
              <Avatar name={expert.user.name} src={expert.user.avatarUrl} size={112} />
            </div>
            {isOwner && (
              <div className="flex items-center gap-3">
                <StatusBadge status={expert.status === "PENDING" ? "REVIEW" : expert.status} />
                <Link href="/dashboard/profile" className="btn-outline !py-2">Edit profile</Link>
              </div>
            )}
          </div>

          <div className="mt-4 space-y-2">
            <h1 className="flex items-center gap-2.5 font-display text-3xl leading-tight sm:text-4xl">
              <span className="min-w-0 break-words">{expert.user.name}</span>
              {isBlueTick(expert) && <BlueTick className="h-7 w-7 shrink-0" />}
            </h1>
            {expert.user.username && <p className="text-sm text-muted">@{expert.user.username}</p>}
            {expert.headline && <p className="max-w-2xl text-lg text-muted">{expert.headline}</p>}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <VerificationBadges expert={expert} showEmpty />
            </div>
          </div>

          <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 border-t border-line pt-5 sm:grid-cols-4">
            <Fact label="Works as">
              {expert.jobTitle}
              <NotVerified show={unv("role")} />
            </Fact>
            <Fact label="Company">
              {expert.company}
              <NotVerified show={unv("company")} />
            </Fact>
            <Fact label="College">
              {expert.college}
              <NotVerified show={unv("college")} />
            </Fact>
            <Fact label="Experience">{years}</Fact>
          </dl>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="space-y-8">
          <section className="card p-6 sm:p-8">
            <h2 className="font-display text-2xl">About</h2>
            <p className="mt-3 max-w-2xl whitespace-pre-line leading-relaxed">{expert.bio}</p>
            <p className="mt-4 text-sm text-muted">{expert.branch}, {gradText} {expert.graduationYear}</p>
            {expert.skills.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-2">{expert.skills.map((s) => <span key={s} className="chip">{s}</span>)}</div>
            )}
          </section>

          <section id="sessions" className="scroll-mt-28">
            <h2 className="font-display text-2xl">{isOwner ? "Your sessions" : "Sessions you can book"}</h2>
            {expert.services.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-line p-8 text-center text-muted">No services listed yet.</p>
            ) : (
              <ul className="mt-5 space-y-4">
                {expert.services.map((s) => (
                  <li key={s.id} className="card card-hover p-5 sm:p-6">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <span className="chip">{SERVICE_TYPES[s.type]}</span>
                        <h3 className="mt-2.5 font-display text-xl">{s.title}</h3>
                        <p className="mt-1 max-w-xl text-sm text-muted">{s.description}</p>
                      </div>
                      <p className="font-display text-3xl">{inr(s.priceInr)}</p>
                    </div>
                    {s.deliverables.length > 0 && (
                      <ul className="mt-4 grid grid-cols-1 gap-x-6 gap-y-1.5 border-t border-line pt-4 text-sm sm:grid-cols-2">
                        {s.deliverables.map((d) => <li key={d} className="flex gap-2"><span className="text-brand">✓</span>{d}</li>)}
                      </ul>
                    )}
                    {canBook ? (
                      <Link href={`/book/${s.id}`} className="btn-primary mt-5">Book this session</Link>
                    ) : (
                      !isOwner && me?.role === "EXPERT" && <p className="mt-4 text-xs text-muted">Booking is for student accounts.</p>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {from !== null && (
            <div className="card p-5">
              <p className="text-sm text-muted">Sessions start at</p>
              <p className="font-display text-4xl">{inr(from)}</p>
              {canBook && <a href="#sessions" className="btn-primary mt-4 w-full">Choose a session</a>}
              <ul className="mt-4 space-y-1.5 text-xs text-muted">
                <li className="flex gap-2"><span className="text-brand">✓</span>Full refund if the expert declines</li>
                <li className="flex gap-2"><span className="text-brand">✓</span>Replies are read by Buncho first</li>
              </ul>
            </div>
          )}

          <div className="card p-5">
            <h3 className="font-display text-lg">Checked by Buncho</h3>
            <ul className="mt-3 space-y-2.5 text-sm">
              <li className="flex items-center justify-between gap-3">
                <span className="text-muted">LinkedIn</span>
                <Check ok={linkedinOk} />
              </li>
              {expert.githubUrl && (
                <li className="flex items-center justify-between gap-3">
                  <span className="text-muted">GitHub</span>
                  <Check ok={githubOk} />
                </li>
              )}
            </ul>
            <p className="mt-3 text-xs text-muted">Buncho checks each expert's profiles for you. Everything, including payment and replies, happens on Buncho.</p>

            {!isOwner && (
              <div className="mt-4 border-t border-line pt-3">
                <ReportButton
                  signedIn={!!me}
                  kind="person"
                  target={{ id: expert.user.id, name: expert.user.name, username: expert.user.username }}
                  label="Report this expert"
                  className="text-xs font-medium text-muted underline hover:text-brand"
                />
              </div>
            )}
          </div>
        </aside>
      </div>
    </article>
  );
}
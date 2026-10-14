import Link from "next/link";
import Avatar from "./Avatar";
import VerificationBadges, { BlueTick, isBlueTick } from "./Badges";
import { BriefcaseIcon, CapIcon, ClockIcon } from "./Icons";
import { inr } from "@/lib/constants";

const MAX_SERVICES = 3;
const MAX_SKILLS = 5;

// One expert as a result row. The left side says who they are; the right side is a
// "rate card" listing what you can book and what it costs, so the decision can be made here.
export default function ExpertCard({ expert }) {
  const services = [...(expert.services ?? [])].sort((a, b) => a.priceInr - b.priceInr);
  const shown = services.slice(0, MAX_SERVICES);
  const hidden = services.length - shown.length;
  const skills = expert.skills ?? [];
  const verified = expert.educationVerified || expert.employmentVerified;
  const years = expert.experienceYears;
  const name = expert.user.name || "Expert";

  return (
    <li className="group card card-hover relative grid gap-5 p-5 has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-brand/40 md:grid-cols-[minmax(0,1fr)_290px] md:gap-6 md:p-6">
      {/* Who they are */}
      <div className="flex min-w-0 gap-4">
        <Avatar name={expert.user.name} src={expert.user.avatarUrl} color={expert.user.avatarColor} icon={expert.user.avatarIcon} size={64} />

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link
              href={`/experts/${expert.slug}`}
              className="min-w-0 truncate font-display text-xl leading-tight after:absolute after:inset-0 after:rounded-xl focus-visible:outline-none"
            >
              {name}
            </Link>
            {isBlueTick(expert) && <BlueTick className="h-5 w-5 shrink-0" />}
          </div>

          <p className="mt-1.5 flex items-center gap-2 text-sm font-medium">
            <BriefcaseIcon className="h-4 w-4 shrink-0 text-muted" />
            <span className="truncate">{expert.jobTitle} at {expert.company}</span>
          </p>
          <p className="mt-1 flex items-center gap-2 text-sm text-muted">
            <CapIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{expert.college}, {expert.branch} &#8217;{String(expert.graduationYear).slice(-2)}</span>
          </p>

          {expert.headline && <p className="mt-3 line-clamp-2 max-w-prose text-[15px] leading-relaxed text-ink/85">{expert.headline}</p>}

          {(verified || years > 0) && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              <VerificationBadges expert={expert} />
              {years > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-0.5 text-xs font-medium text-muted">
                  <ClockIcon className="h-3.5 w-3.5" />
                  {years} {years === 1 ? "yr" : "yrs"} experience
                </span>
              )}
            </div>
          )}

          {skills.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {skills.slice(0, MAX_SKILLS).map((s) => (
                <span key={s} className="rounded-md border border-line px-2 py-0.5 text-xs text-muted">{s}</span>
              ))}
              {skills.length > MAX_SKILLS && <span className="px-1 py-0.5 text-xs text-muted">+{skills.length - MAX_SKILLS} more</span>}
            </div>
          )}
        </div>
      </div>

      {/* Rate card */}
      <div className="flex flex-col rounded-xl border border-line bg-surface-2/60 p-4">
        {shown.length > 0 ? (
          <ul className="space-y-2.5">
            {shown.map((s, i) => (
              <li key={`${s.title}-${i}`} className="flex items-baseline gap-2 text-sm">
                <span className="min-w-0 truncate">{s.title}</span>
                <span aria-hidden="true" className="min-w-3 flex-1 translate-y-[-3px] border-b-2 border-dotted border-muted/35" />
                <span className="shrink-0 font-display tabular-nums">{inr(s.priceInr)}</span>
              </li>
            ))}
            {hidden > 0 && <li className="text-xs text-muted">+{hidden} more {hidden === 1 ? "service" : "services"}</li>}
          </ul>
        ) : (
          <div>
            <p className="text-sm font-medium">No services yet</p>
            <p className="mt-0.5 text-xs leading-relaxed text-muted">You can book once they list one. The profile has the full story.</p>
          </div>
        )}

        <div className="mt-auto pt-4">
          <span className={`w-full ${shown.length > 0 ? "btn-primary group-hover:bg-brand-dark" : "btn-outline group-hover:border-brand group-hover:text-brand"}`}>
            View profile
          </span>
        </div>
      </div>
    </li>
  );
}

import Link from "next/link";
import Avatar from "./Avatar";
import VerificationBadges, { BlueTick, isBlueTick } from "./Badges";
import { SERVICE_TYPES, inr } from "@/lib/constants";

export default function ExpertCard({ expert }) {
  const services = expert.services ?? [];
  const from = services.length ? Math.min(...services.map((s) => s.priceInr)) : null;
  const types = [...new Set(services.map((s) => s.type))].slice(0, 3);
  const verified = expert.educationVerified || expert.employmentVerified;

  return (
    <li className="card card-hover relative flex flex-col gap-3.5 p-5">
      <div className="flex items-start gap-3.5">
        <Avatar name={expert.user.name} src={expert.user.avatarUrl} size={52} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link href={`/experts/${expert.slug}`} className="min-w-0 truncate font-display text-lg leading-tight after:absolute after:inset-0">
              {expert.user.name || "Expert"}
            </Link>
            {isBlueTick(expert) && <BlueTick className="h-5 w-5 shrink-0" />}
          </div>
          <p className="truncate text-sm font-medium">{expert.jobTitle} at {expert.company}</p>
          <p className="truncate text-sm text-muted">{expert.college}, {expert.branch} '{String(expert.graduationYear).slice(-2)}</p>
        </div>
      </div>

      {expert.headline && <p className="line-clamp-2 text-sm text-muted">{expert.headline}</p>}

      {verified && (
        <div className="flex flex-wrap gap-1.5">
          <VerificationBadges expert={expert} />
        </div>
      )}

      {expert.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {expert.skills.slice(0, 4).map((s) => <span key={s} className="rounded-md bg-surface-2 px-2 py-0.5 text-xs text-muted">{s}</span>)}
        </div>
      )}

      <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-3.5">
        <p className="min-w-0 truncate text-xs text-muted">{types.map((t) => SERVICE_TYPES[t]).join(", ") || "No services yet"}</p>
        {from !== null && (
          <p className="shrink-0 text-right leading-tight">
            <span className="block text-xs text-muted">from</span>
            <span className="font-display text-lg">{inr(from)}</span>
          </p>
        )}
      </div>
    </li>
  );
}
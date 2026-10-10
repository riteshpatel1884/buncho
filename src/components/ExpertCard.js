import Link from "next/link";
import Avatar from "./Avatar";
import VerificationBadges, { BlueTick, isBlueTick } from "./Badges";
import { SERVICE_TYPES, inr } from "@/lib/constants";

// `index` is accepted so existing callers keep working. Cards no longer animate in.
export default function ExpertCard({ expert }) {
  const services = expert.services ?? [];
  const from = services.length ? Math.min(...services.map((s) => s.priceInr)) : null;
  const types = [...new Set(services.map((s) => s.type))].slice(0, 3);
  const verified = expert.educationVerified || expert.employmentVerified;

  return (
    <li className="card card-hover relative flex flex-col gap-3 p-5">
      <div className="flex items-start gap-3">
        <Avatar name={expert.user.name} src={expert.user.avatarUrl} size={52} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <Link href={`/experts/${expert.slug}`} className="min-w-0 truncate font-display text-xl leading-tight after:absolute after:inset-0">
              {expert.user.name || "Expert"}
            </Link>
            {isBlueTick(expert) && <BlueTick className="h-5 w-5 shrink-0" />}
          </div>
          <p className="truncate text-sm">{expert.jobTitle} at {expert.company}</p>
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
        <p className="truncate text-sm text-muted">Knows {expert.skills.slice(0, 4).join(", ")}</p>
      )}

      <div className="mt-auto flex items-end justify-between gap-3 border-t border-dashed border-line pt-3">
        <p className="min-w-0 truncate text-xs text-muted">{types.map((t) => SERVICE_TYPES[t]).join(", ") || "No services yet"}</p>
        {from !== null && (
          <p className="shrink-0 text-right">
            <span className="block text-xs text-muted">from</span>
            <span className="font-display text-xl">{inr(from)}</span>
          </p>
        )}
      </div>
    </li>
  );
}
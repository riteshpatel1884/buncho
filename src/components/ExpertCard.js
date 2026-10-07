import Link from "next/link";
import Avatar from "./Avatar";
import VerificationBadges from "./Badges";
import { SERVICE_TYPES, inr } from "@/lib/constants";

export default function ExpertCard({ expert, index = 0 }) {
  const services = expert.services ?? [];
  const from = services.length ? Math.min(...services.map((s) => s.priceInr)) : null;
  const types = [...new Set(services.map((s) => s.type))].slice(0, 3);

  return (
    <li className="card card-hover glow rise relative flex flex-col gap-4 p-5" style={{ "--i": Math.min(index, 8) }}>
      <div className="flex items-start gap-3">
        <Avatar name={expert.user.name} src={expert.user.avatarUrl} size={56} />
        <div className="min-w-0 flex-1">
          <Link href={`/experts/${expert.slug}`} className="block truncate font-display text-lg font-semibold leading-tight after:absolute after:inset-0">
            {expert.user.name || "Expert"}
          </Link>
          <p className="truncate text-sm text-muted">{expert.jobTitle} at {expert.company}</p>
          <p className="truncate text-xs text-muted">{expert.college}, {expert.branch} '{String(expert.graduationYear).slice(-2)}</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        <VerificationBadges expert={expert} />
      </div>

      {expert.skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {expert.skills.slice(0, 4).map((s) => <span key={s} className="rounded-full border border-line px-2.5 py-0.5 text-xs text-muted">{s}</span>)}
        </div>
      )}

      <div className="mt-auto flex items-end justify-between gap-3 border-t border-line pt-3">
        <p className="min-w-0 truncate text-xs text-muted">{types.map((t) => SERVICE_TYPES[t]).join(", ") || "No services yet"}</p>
        {from !== null && (
          <p className="shrink-0 text-right">
            <span className="block text-xs text-muted">from</span>
            <span className="font-display text-lg font-bold">{inr(from)}</span>
          </p>
        )}
      </div>
    </li>
  );
}

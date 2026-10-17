import Link from "next/link";
import { Clock, Users } from "lucide-react";
import TagChip from "./tag-chip";
import { card } from "./ui";
import { POLL_TYPES, STATUS_STYLES, effectiveStatus, timeLeft } from "@/lib/poll-utils";

export default function PollCard({ poll }) {
  const status = effectiveStatus(poll);
  const type = POLL_TYPES[poll.type];
  return (
    <article className={`${card} p-5 transition hover:border-brand/60`}>
      <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
        <span className={`rounded-full px-2.5 py-0.5 font-medium ${type.cls}`}>{type.label}</span>
        <span className={`rounded-full px-2.5 py-0.5 font-medium ${STATUS_STYLES[status]}`}>{status}</span>
      </div>
      <Link href={`/polls/${poll.id}`} className="block text-lg font-semibold leading-snug hover:text-brand">
        {poll.question}
      </Link>
      <div className="mt-3 flex flex-wrap gap-2">
        {poll.tags.map((t) => <TagChip key={t.id} tag={t} />)}
      </div>
      <div className="mt-4 flex items-center gap-4 text-xs text-muted">
        <span className="inline-flex items-center gap-1"><Users className="size-3.5" />{poll._count.votes} votes</span>
        <span className="inline-flex items-center gap-1"><Clock className="size-3.5" />{status === "OPEN" ? timeLeft(poll.closesAt) : "Ended"}</span>
        <span className="ml-auto">by @{poll.author.username}</span>
      </div>
    </article>
  );
}
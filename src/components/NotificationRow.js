import Link from "next/link";
import Avatar from "./Avatar";
import { timeAgo } from "@/lib/feed/feed";

const ICON = {
  FOLLOW: "M16 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8 12a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM2 20a6 6 0 0 1 12 0M14 20a5 5 0 0 1 8 0",
  LIKE: "M12 21s-7.5-4.6-9.5-9.2C1 8.4 3 5 6.4 5c2 0 3.6 1 4.6 2.6C12 6 13.6 5 15.6 5 19 5 21 8.4 19.5 11.8 19.5 11.8 12 21 12 21z",
  COMMENT: "M4 5h16v11H9l-5 4z",
  REPLY: "M4 4v6a4 4 0 0 0 4 4h12M16 9l5 5-5 5",
  MENTION: "M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM16 12v1.5a2.5 2.5 0 0 0 5 0V12a9 9 0 1 0-3.5 7.1",
  MESSAGE: "M4 5h16v11H9l-5 4zM8 10h8",
};

// One line in the bell's drop-down and on the /notifications page.
export default function NotificationRow({ n, onNavigate }) {
  const color = n.type === "LIKE" ? "bg-[#f43f5e] text-white" : "bg-brand text-on-brand";
  return (
    <li>
      <Link
        href={n.href}
        onClick={onNavigate}
        className={`flex items-start gap-3 px-4 py-3 transition-colors hover:bg-surface-2 ${n.read ? "" : "bg-brand-soft/50"}`}
      >
        <span className="relative shrink-0">
          <Avatar name={n.actor?.name || "Buncho"} src={n.actor?.avatarUrl} color={n.actor?.avatarColor} icon={n.actor?.avatarIcon} size={40} />
          <span className={`absolute -bottom-1 -right-1 flex h-[18px] w-[18px] items-center justify-center rounded-full ring-2 ring-surface ${color}`} aria-hidden="true">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d={ICON[n.type] || ICON.MESSAGE} /></svg>
          </span>
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm leading-snug">{n.text}</span>
          {n.preview && <span className="mt-0.5 line-clamp-2 block break-words text-[13px] leading-snug text-muted">“{n.preview}”</span>}
          <span className="mt-1 block text-xs text-muted">{timeAgo(n.createdAt)}</span>
        </span>
        {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand" aria-label="Unread" />}
      </Link>
    </li>
  );
}
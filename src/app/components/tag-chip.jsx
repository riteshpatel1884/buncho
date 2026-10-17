import Link from "next/link";

export default function TagChip({ tag }) {
  return (
    <Link
      href={`/polls?tag=${tag.slug}`}
      className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted hover:text-fg"
    >
      {tag.name}
    </Link>
  );
}
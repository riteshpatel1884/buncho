import Link from "next/link";

export default function CategoryFilter({ categories, active, sort, q }) {
  const href = (slug) => {
    const p = new URLSearchParams();
    if (slug) p.set("category", slug);
    if (sort) p.set("sort", sort);
    if (q) p.set("q", q);
    const s = p.toString();
    return s ? `/?${s}` : "/";
  };
  const chip = (isActive) =>
    `rounded-full border px-3 py-1 text-sm ${
      isActive ? "border-ink bg-ink text-white" : "border-line bg-white hover:border-ink"
    }`;
  return (
    <div className="flex flex-wrap gap-2">
      <Link href={href(null)} className={chip(!active)}>All</Link>
      {categories.map((c) => (
        <Link key={c.id} href={href(c.slug)} className={chip(active === c.slug)}>
          {c.name}
        </Link>
      ))}
    </div>
  );
}

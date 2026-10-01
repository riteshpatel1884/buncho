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
  const chip = (on) =>
    `shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition duration-200 hover:-translate-y-0.5 active:scale-95 ${
      on ? "border-brand bg-brand text-on-brand" : "border-line bg-surface text-muted hover:border-ink hover:text-ink"
    }`;
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      <Link href={href(null)} className={chip(!active)}>All</Link>
      {categories.map((c) => (
        <Link key={c.id} href={href(c.slug)} className={chip(active === c.slug)}>
          {c.name}
        </Link>
      ))}
    </div>
  );
}
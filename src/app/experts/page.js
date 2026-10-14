import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ExpertCard from "@/components/ExpertCard";
import { SERVICE_TYPES, inr } from "@/lib/constants";
import { isBlueTick } from "@/components/Badges";
import { SearchIcon, SlidersIcon, ChevronIcon, CloseIcon, CheckCircleIcon } from "@/components/Icons";

export const dynamic = "force-dynamic";
export const metadata = { title: "Find experts | buncho" };

const STOP = new Set(["the", "and", "for", "with", "that", "have", "want", "need", "get", "can", "how", "isn", "not", "but", "are", "was", "has", "from", "this", "into", "help", "i'm", "my"]);

export default async function Experts({ searchParams }) {
  const sp = await searchParams;
  const q = (sp.q || "").trim();
  const service = Object.hasOwn(SERVICE_TYPES, sp.service) ? sp.service : "";
  const college = (sp.college || "").trim();
  const branch = (sp.branch || "").trim();
  const gradYear = Number.parseInt(sp.gradYear, 10) || null;
  const maxPrice = Number.parseInt(sp.maxPrice, 10) || null;
  const sort = ["newest", "priceLow", "priceHigh"].includes(sp.sort) ? sp.sort : q ? "relevance" : "newest";

  const tokens = q
    .toLowerCase()
    .split(/[^a-z0-9+#.]+/)
    .filter((w) => w.length >= 3 && !STOP.has(w))
    .slice(0, 8);

  const where = { status: "ACTIVE" };
  if (college) where.college = { contains: college, mode: "insensitive" };
  if (branch) where.branch = { contains: branch, mode: "insensitive" };
  if (gradYear) where.graduationYear = gradYear;
  if (service || maxPrice) {
    where.services = {
      some: { active: true, ...(service ? { type: service } : {}), ...(maxPrice ? { priceInr: { lte: maxPrice } } : {}) },
    };
  }
  if (tokens.length) {
    const text = (field, t) => ({ [field]: { contains: t, mode: "insensitive" } });
    where.OR = tokens.flatMap((t) => [
      text("headline", t), text("jobTitle", t), text("company", t), text("bio", t), text("college", t),
      { skills: { has: t } },
      { user: { name: { contains: t, mode: "insensitive" } } },
      { services: { some: { active: true, OR: [text("title", t), text("description", t)] } } },
    ]);
  }

  const experts = await prisma.expertProfile.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 60,
    include: {
      user: { select: { name: true, avatarUrl: true, avatarColor: true, avatarIcon: true } },
      services: { where: { active: true }, select: { type: true, title: true, priceInr: true } },
    },
  });

  const fromPrice = (e) => (e.services.length ? Math.min(...e.services.map((s) => s.priceInr)) : Infinity);
  const relevance = (e) => {
    const hay = [e.headline, e.jobTitle, e.company, e.bio, e.college, e.user.name, ...e.skills, ...e.services.map((s) => s.title)]
      .filter(Boolean).join(" ").toLowerCase();
    return (
      tokens.filter((t) => hay.includes(t)).length +
      (e.educationVerified ? 0.5 : 0) +
      (e.employmentVerified ? 0.5 : 0) +
      (isBlueTick(e) ? 1 : 0)
    );
  };
  if (sort === "priceLow") experts.sort((a, b) => fromPrice(a) - fromPrice(b));
  else if (sort === "priceHigh") experts.sort((a, b) => (fromPrice(b) === Infinity ? -1 : fromPrice(b)) - (fromPrice(a) === Infinity ? -1 : fromPrice(a)));
  else if (sort === "relevance") experts.sort((a, b) => relevance(b) - relevance(a));
  else if (sort === "newest") experts.sort((a, b) => Number(isBlueTick(b)) - Number(isBlueTick(a))); // stable: newest-first order is kept inside each group

  // ---------- UI helpers ----------
  const sortParam = ["newest", "priceLow", "priceHigh"].includes(sp.sort) ? sp.sort : "";
  const state = { q, service, college, branch, gradYear, maxPrice, sort: sortParam };

  // Builds a /experts link that keeps every current filter except the ones overridden.
  const href = (overrides = {}) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries({ ...state, ...overrides })) if (v) params.set(k, String(v));
    const qs = params.toString();
    return qs ? `/experts?${qs}` : "/experts";
  };

  const extraCount = [college, branch, gradYear, maxPrice].filter(Boolean).length;
  const active = extraCount + (q ? 1 : 0) + (service ? 1 : 0);

  const chips = [
    q && { key: "q", label: `\u201c${q.length > 32 ? q.slice(0, 32) + "\u2026" : q}\u201d` },
    college && { key: "college", label: college },
    branch && { key: "branch", label: branch },
    gradYear && { key: "gradYear", label: `Graduated ${gradYear}` },
    maxPrice && { key: "maxPrice", label: `Up to ${inr(maxPrice)}` },
  ].filter(Boolean);

  const sorts = [
    ...(q ? [{ value: "", id: "relevance", label: "Best match" }] : []),
    { value: q ? "newest" : "", id: "newest", label: "Newest" },
    { value: "priceLow", id: "priceLow", label: "Price: low" },
    { value: "priceHigh", id: "priceHigh", label: "Price: high" },
  ];

  const pill = (on) =>
    `shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-colors ${
      on ? "border-brand bg-brand text-on-brand" : "border-line bg-surface text-ink hover:border-brand hover:text-brand"
    }`;

  return (
    <div className="space-y-8">
      {/* Finder */}
      <header className="finder-wash rounded-3xl border border-line px-5 py-8 sm:px-10 sm:py-12">
        <h1 className="font-display text-4xl leading-[1.08] sm:text-5xl">Find an expert</h1>
        <p className="mt-3 max-w-2xl text-base text-muted sm:text-lg">
          Tell us what you are working on, or narrow by service, college and budget.
        </p>

        <form data-nav action="/experts" className="mt-7 max-w-3xl">
          {service && <input type="hidden" name="service" value={service} />}
          {sortParam && <input type="hidden" name="sort" value={sortParam} />}

          <div className="flex items-center gap-2 rounded-2xl border border-line bg-surface p-2 shadow-[0_8px_30px_-12px_rgba(11,27,51,0.25)] focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15">
            <SearchIcon className="ml-3 h-5 w-5 shrink-0 text-muted" />
            <input
              name="q"
              type="search"
              defaultValue={q}
              aria-label="What do you need help with?"
              placeholder="What do you need help with?"
              className="min-w-0 flex-1 bg-transparent px-1 py-2.5 text-base placeholder:text-muted/70 focus-visible:outline-none"
            />
            <button className="btn-primary h-11 shrink-0 px-4 sm:px-6" aria-label="Search">
              <SearchIcon className="h-5 w-5 sm:hidden" />
              <span className="hidden sm:inline">Search</span>
            </button>
          </div>

          <details className="group mt-3" open={extraCount > 0}>
            <summary className="inline-flex cursor-pointer list-none items-center gap-2 rounded-lg py-1.5 text-sm font-medium text-muted hover:text-ink [&::-webkit-details-marker]:hidden">
              <SlidersIcon className="h-4 w-4" />
              More filters
              {extraCount > 0 && <span className="chip">{extraCount}</span>}
              <ChevronIcon className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="mt-3 rounded-2xl border border-line bg-surface p-4 sm:p-5">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <label className="block text-sm font-medium">College
                  <input name="college" defaultValue={college} placeholder="IIIT Kalyani" className="input mt-1.5" />
                </label>
                <label className="block text-sm font-medium">Branch
                  <input name="branch" defaultValue={branch} placeholder="CSE" className="input mt-1.5" />
                </label>
                <label className="block text-sm font-medium">Graduated in
                  <input name="gradYear" type="number" min={1990} max={2035} defaultValue={gradYear ?? ""} placeholder="2024" className="input mt-1.5" />
                </label>
                <label className="block text-sm font-medium">Max price (&#8377;)
                  <input name="maxPrice" type="number" min={0} defaultValue={maxPrice ?? ""} placeholder="500" className="input mt-1.5" />
                </label>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button className="btn-primary">Apply filters</button>
                {active > 0 && <Link href="/experts" className="btn-outline">Clear all</Link>}
              </div>
            </div>
          </details>
        </form>

        <nav aria-label="Filter by service" className="no-scrollbar fade-edge-mobile -mx-1 mt-5 flex gap-2 overflow-x-auto px-1 py-1">
          <Link href={href({ service: "" })} aria-current={!service ? "true" : undefined} className={pill(!service)}>All services</Link>
          {Object.entries(SERVICE_TYPES).map(([k, v]) => (
            <Link key={k} href={href({ service: k })} aria-current={service === k ? "true" : undefined} className={pill(service === k)}>{v}</Link>
          ))}
        </nav>
      </header>

      {sp.welcome && (
        <p role="status" className="flex max-w-2xl items-start gap-3 rounded-2xl bg-brand-soft p-4 text-sm font-medium text-brand">
          <CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0" />
          You&#8217;re all set. Find an expert to book your first session.
        </p>
      )}

      {/* Results */}
      <section aria-label="Results" className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <h2 aria-live="polite" className="font-display text-xl">
            {experts.length} {experts.length === 1 ? "expert" : "experts"}
          </h2>

          {experts.length > 1 && (
            <div role="group" aria-label="Sort results" className="inline-flex rounded-xl border border-line bg-surface p-1 text-sm">
              {sorts.map((o) => {
                const on = (sortParam || (q ? "relevance" : "newest")) === o.id;
                return (
                  <Link
                    key={o.id}
                    href={href({ sort: o.value })}
                    aria-current={on ? "true" : undefined}
                    className={`rounded-lg px-3 py-1.5 font-medium transition-colors ${on ? "bg-brand-soft text-brand" : "text-muted hover:text-ink"}`}
                  >
                    {o.label}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {active > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {chips.map((c) => (
              <Link
                key={c.key}
                href={href({ [c.key]: "" })}
                aria-label={`Remove filter: ${c.label}`}
                className="group/chip inline-flex max-w-full items-center gap-1.5 rounded-full border border-line bg-surface py-1 pl-3 pr-2 text-sm hover:border-brand"
              >
                <span className="truncate">{c.label}</span>
                <CloseIcon className="h-3.5 w-3.5 shrink-0 text-muted group-hover/chip:text-brand" />
              </Link>
            ))}
            <Link href="/experts" className="px-2 py-1 text-sm font-medium text-brand hover:underline">Clear all</Link>
          </div>
        )}

        {experts.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-line px-6 py-14 text-center sm:py-20">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
              <SearchIcon className="h-6 w-6" />
            </span>
            <p className="mt-5 font-display text-2xl">No one matches yet.</p>
            <p className="mx-auto mt-2 max-w-sm text-sm text-muted">Try fewer filters, or check back soon. New experts join every week.</p>
            {active > 0 && <Link href="/experts" className="btn-primary mt-6">Clear filters</Link>}
          </div>
        ) : (
          <ul className="space-y-4">
            {experts.map((e) => <ExpertCard key={e.id} expert={e} />)}
          </ul>
        )}
      </section>
    </div>
  );
}

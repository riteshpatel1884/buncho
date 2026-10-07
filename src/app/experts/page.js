import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ExpertCard from "@/components/ExpertCard";
import { SERVICE_TYPES } from "@/lib/constants";

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
      user: { select: { name: true, avatarUrl: true } },
      services: { where: { active: true }, select: { type: true, title: true, priceInr: true } },
    },
  });

  const fromPrice = (e) => (e.services.length ? Math.min(...e.services.map((s) => s.priceInr)) : Infinity);
  const relevance = (e) => {
    const hay = [e.headline, e.jobTitle, e.company, e.bio, e.college, e.user.name, ...e.skills, ...e.services.map((s) => s.title)]
      .filter(Boolean).join(" ").toLowerCase();
    return tokens.filter((t) => hay.includes(t)).length + (e.educationVerified ? 0.5 : 0) + (e.employmentVerified ? 0.5 : 0);
  };
  if (sort === "priceLow") experts.sort((a, b) => fromPrice(a) - fromPrice(b));
  else if (sort === "priceHigh") experts.sort((a, b) => (fromPrice(b) === Infinity ? -1 : fromPrice(b)) - (fromPrice(a) === Infinity ? -1 : fromPrice(a)));
  else if (sort === "relevance") experts.sort((a, b) => relevance(b) - relevance(a));

  const active = [q, service, college, branch, gradYear, maxPrice].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Find an expert</h1>
        <p className="mt-1 text-muted">Describe what you need, or filter by college, role and service.</p>
        {sp.welcome && <p role="status" className="mt-4 rounded-xl bg-brand-soft p-3 text-sm font-medium text-brand">You're all set. Find an expert to book your first session.</p>}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_minmax(0,1fr)]">
        <details className="card group h-fit p-4 lg:sticky lg:top-24 lg:p-5" open>
          <summary className="cursor-pointer font-display text-lg font-bold lg:pointer-events-none">
            Search and filters {active > 0 && <span className="chip ml-1">{active}</span>}
          </summary>
          <form data-nav className="mt-4 space-y-4">
            <label className="block text-sm font-medium">What do you need help with?
              <textarea name="q" rows={2} defaultValue={q} placeholder="AI internship, my resume isn't getting shortlisted" className="input mt-1.5" />
            </label>
            <label className="block text-sm font-medium">Service
              <select name="service" defaultValue={service} className="input mt-1.5">
                <option value="">Any service</option>
                {Object.entries(SERVICE_TYPES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
              </select>
            </label>
            <label className="block text-sm font-medium">College
              <input name="college" defaultValue={college} placeholder="Your college" className="input mt-1.5" />
            </label>
            <label className="block text-sm font-medium">Branch
              <input name="branch" defaultValue={branch} placeholder="CSE" className="input mt-1.5" />
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-medium">Graduated
                <input name="gradYear" type="number" min={1990} max={2035} defaultValue={gradYear ?? ""} placeholder="2024" className="input mt-1.5" />
              </label>
              <label className="block text-sm font-medium">Max price (₹)
                <input name="maxPrice" type="number" min={0} defaultValue={maxPrice ?? ""} placeholder="500" className="input mt-1.5" />
              </label>
            </div>
            <label className="block text-sm font-medium">Sort by
              <select name="sort" defaultValue={sort} className="input mt-1.5">
                {q && <option value="relevance">Best match</option>}
                <option value="newest">Newest</option>
                <option value="priceLow">Price: low to high</option>
                <option value="priceHigh">Price: high to low</option>
              </select>
            </label>
            <div className="flex gap-2">
              <button className="btn-primary flex-1">Search</button>
              {active > 0 && <Link href="/experts" className="btn-outline">Clear</Link>}
            </div>
          </form>
        </details>

        <section>
          <p className="mb-4 text-sm text-muted">{experts.length} {experts.length === 1 ? "expert" : "experts"}</p>
          {experts.length === 0 ? (
            <div className="card border-dashed p-10 text-center">
              <p className="font-display text-lg font-semibold">No experts match yet</p>
              <p className="mt-1 text-sm text-muted">Try fewer filters, or check back soon. New experts join every week.</p>
              {active > 0 && <Link href="/experts" className="btn-primary mt-5">Clear filters</Link>}
            </div>
          ) : (
            <ul className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {experts.map((e, i) => <ExpertCard key={e.id} expert={e} index={i} />)}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

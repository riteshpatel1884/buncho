import { prisma } from "@/lib/prisma";
import SubmitForm from "./SubmitForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Launch a product | buncho" };

export default async function SubmitPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-4xl font-bold">Launch your product</h1>
        <p className="mt-2 max-w-xl text-muted">Tell people what you built. We review every submission by hand before it goes live.</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <SubmitForm categories={categories} />

        <aside className="space-y-5">
          <div className="card p-5">
            <h2 className="font-display text-lg font-bold">What happens next</h2>
            <ol className="mt-3 space-y-3 text-sm text-muted">
              <li>1. You submit the form. Your product shows as "In review" on your dashboard.</li>
              <li>2. We check the link and details, usually within a day.</li>
              <li>3. Once approved, it goes live and can collect upvotes.</li>
            </ol>
          </div>
          <div className="rounded-2xl bg-peacock-soft p-5">
            <h2 className="font-display text-lg font-bold text-peacock-dark">Tips for a good listing</h2>
            <ul className="mt-3 space-y-2 text-sm text-peacock-dark">
              <li>Say what it does in the tagline, not how great it is.</li>
              <li>Use a square logo, at least 256 pixels wide.</li>
              <li>Mention who it is for and what it costs.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

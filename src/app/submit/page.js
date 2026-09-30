import { prisma } from "@/lib/prisma";
import SubmitForm from "./SubmitForm";

export const dynamic = "force-dynamic";

export default async function SubmitPage() {
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">Launch your product</h1>
      <p className="text-muted">We review every submission by hand before it goes live.</p>
      <SubmitForm categories={categories} />
    </div>
  );
}

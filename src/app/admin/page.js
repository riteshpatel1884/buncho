import { notFound } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/user";

export const dynamic = "force-dynamic";

async function setStatus(formData) {
  "use server";
  if (!(await isAdmin())) return;
  const id = String(formData.get("id"));
  const status = String(formData.get("status"));
  if (!["APPROVED", "REJECTED"].includes(status)) return;
  await prisma.product.update({ where: { id }, data: { status } });
  revalidatePath("/admin");
  revalidatePath("/");
}

export default async function Admin() {
  if (!(await isAdmin())) notFound();
  const pending = await prisma.product.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { user: { select: { email: true } }, category: true },
  });

  return (
    <div className="space-y-4">
      <h1 className="font-display text-3xl font-bold">Pending review ({pending.length})</h1>
      {pending.length === 0 && <p className="text-muted">Nothing waiting.</p>}
      {pending.map((p) => (
        <div key={p.id} className="rounded-xl border border-line bg-white p-4">
          <p className="font-display text-lg font-semibold">{p.name}</p>
          <p className="text-sm text-muted">{p.tagline}</p>
          <p className="mt-2 text-sm">{p.description}</p>
          <p className="mt-2 text-sm">
            <a href={p.websiteUrl} target="_blank" rel="noopener noreferrer" className="text-accent underline">{p.websiteUrl}</a>
            {" "}by {p.user.email} in {p.category.name}
          </p>
          <form action={setStatus} className="mt-3 flex gap-2">
            <input type="hidden" name="id" value={p.id} />
            <button name="status" value="APPROVED" className="rounded-md bg-accent px-3 py-1.5 text-white">Approve</button>
            <button name="status" value="REJECTED" className="rounded-md border border-line px-3 py-1.5">Reject</button>
          </form>
        </div>
      ))}
    </div>
  );
}

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, isAdmin } from "@/lib/user";
import AdminProfileForm from "@/components/AdminProfileForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin profile | buncho" };

export default async function AdminProfilePage() {
  const user = await requireUser("/onboarding/admin/profile");
  if (user.role) redirect("/dashboard");
  // Only people who passed the code check can see this form.
  if (!(await isAdmin())) redirect("/onboarding/admin");

  const profile = await prisma.adminProfile.findUnique({ where: { userId: user.id } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Your admin profile</h1>
        <p className="mt-2 text-muted">Code verified. Fill in whatever you like. Every field is optional.</p>
      </div>
      <AdminProfileForm profile={profile} name={user.name} username={user.username} />
    </div>
  );
}
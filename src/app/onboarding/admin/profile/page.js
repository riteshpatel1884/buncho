import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, isAdmin } from "@/lib/user";
import AdminProfileForm from "@/components/AdminProfileForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin profile | buncho" };

export default async function AdminProfilePage() {
  const user = await requireUser("/onboarding/admin/profile");
  // Only administrators can access this form. Admins may also have a normal
  // student/expert role if they were granted access through ADMIN_CLERK_IDS.
  const admin = await isAdmin();
  if (!admin) {
    if (user.role) redirect("/dashboard");
    redirect("/onboarding/admin");
  }

  const profile = await prisma.adminProfile.findUnique({ where: { userId: user.id } });

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Edit your admin profile</h1>
        <p className="mt-2 text-muted">Update your public Buncho team details. Every field is optional.</p>
      </div>
      <AdminProfileForm profile={profile} name={user.name} username={user.username} />
    </div>
  );
}
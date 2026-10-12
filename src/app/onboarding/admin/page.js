import { redirect } from "next/navigation";
import { requireUser, isAdmin } from "@/lib/user";
import AdminCodeForm from "@/components/AdminCodeForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin access | buncho" };

export default async function AdminOnboarding() {
  const user = await requireUser("/onboarding/admin");
  if (user.role) redirect("/dashboard");
  if (await isAdmin()) redirect("/onboarding/admin/profile");

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Admin access</h1>
        <p className="mt-2 text-muted">Enter the admin code to continue. Expert details are not needed for admins.</p>
      </div>
      <AdminCodeForm />
    </div>
  );
}
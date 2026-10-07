import { redirect } from "next/navigation";
import { requireUser } from "@/lib/user";
import ExpertProfileForm from "@/components/ExpertProfileForm";

export const metadata = { title: "Become an expert | buncho" };

export default async function ExpertOnboarding() {
  const user = await requireUser("/onboarding/expert");
  if (user.role) redirect("/dashboard");
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Become an expert</h1>
        <p className="mt-2 text-muted">
          Share your background. Buncho checks your education and employment before your profile goes live, so students can trust it.
        </p>
      </div>
      <ExpertProfileForm name={user.name} submitLabel="Submit for review" />
    </div>
  );
}

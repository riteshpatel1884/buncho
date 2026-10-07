import { redirect } from "next/navigation";
import { requireUser } from "@/lib/user";
import StudentProfileForm from "@/components/StudentProfileForm";

export const metadata = { title: "Student profile | buncho" };

export default async function StudentOnboarding() {
  const user = await requireUser("/onboarding/student");
  if (user.role) redirect("/dashboard");
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Tell us about you</h1>
        <p className="mt-2 text-muted">Experts see this when you book, so they can help with what you actually need.</p>
      </div>
      <StudentProfileForm name={user.name} submitLabel="Continue" />
    </div>
  );
}

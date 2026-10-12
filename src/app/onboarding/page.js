import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser, isAdmin } from "@/lib/user";

export const dynamic = "force-dynamic";
export const metadata = { title: "Welcome | buncho" };

export default async function OnboardingPage() {
  const user = await requireUser("/onboarding");
  if (user.role) redirect("/dashboard");
  if (await isAdmin()) redirect("/admin"); // already registered as admin

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Welcome to buncho</h1>
        <p className="mt-1 text-muted">How do you want to use buncho?</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="card space-y-3 p-5">
          <h2 className="font-display text-xl">I'm a student</h2>
          <p className="text-sm text-muted">Find verified experts and get help with your resume, interviews and projects.</p>
          <Link href="/onboarding/student" className="btn-primary inline-block">Continue as student</Link>
        </div>

        <div className="card space-y-3 p-5">
          <h2 className="font-display text-xl">I'm an expert</h2>
          <p className="text-sm text-muted">Share your experience, offer services and get booked by students.</p>
          <Link href="/onboarding/expert" className="btn-outline inline-block">Continue as expert</Link>
        </div>

        <div className="card space-y-3 p-5">
          <h2 className="font-display text-xl">I'm an admin</h2>
          <p className="text-sm text-muted">Part of the Buncho team? Enter the admin code to manage the platform.</p>
          <Link href="/onboarding/admin" className="btn-outline inline-block">Continue as admin</Link>
        </div>
      </div>
    </div>
  );
}
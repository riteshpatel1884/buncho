import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/user";
import ProjectForm from "@/components/projects/ProjectForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Post a project | buncho" };

export default async function NewProject() {
  const user = await requireUser("/projects/new");
  if (!user.role) redirect("/onboarding");
  if (user.role !== "STUDENT") {
    return (
      <div className="mx-auto max-w-lg py-16">
        <h1 className="font-display text-4xl leading-tight">Projects are posted by students.</h1>
        <p className="mt-3 text-muted">You're signed in as an expert. Browse open projects and send proposals instead.</p>
        <Link href="/projects" className="btn-primary mt-6">See open projects</Link>
      </div>
    );
  }
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/projects" className="text-sm font-medium text-muted hover:text-ink">Back to projects</Link>
      <div>
        <h1 className="font-display text-3xl sm:text-4xl">Post a project</h1>
        <p className="mt-1 text-muted">Set your budget and receive proposals from interested experts.</p>
      </div>
      <ProjectForm />
    </div>
  );
}
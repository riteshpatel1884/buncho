import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireUser, isAdmin } from "@/lib/user";
import StudentProfileForm from "@/components/StudentProfileForm";
import ExpertProfileForm from "@/components/ExpertProfileForm";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit profile | buncho" };

export default async function ProfilePage() {
  const user = await requireUser("/dashboard/profile");
  // Admin doesn't have to register as a student or expert.
  if (!user.role) redirect((await isAdmin()) ? "/admin" : "/onboarding");

  const [student, expert] = await Promise.all([
    user.role === "STUDENT" ? prisma.studentProfile.findUnique({ where: { userId: user.id } }) : null,
    user.role === "EXPERT" ? prisma.expertProfile.findUnique({ where: { userId: user.id } }) : null,
  ]);

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-ink">Back to dashboard</Link>
      <h1 className="font-display text-3xl font-bold sm:text-4xl">Edit profile</h1>
      {user.role === "STUDENT" ? (
        <StudentProfileForm profile={student} name={user.name} username={user.username} />
      ) : (
        <>
          <p className="text-sm text-muted">If you change your college, company or role, the Buncho team may re-check your verification.</p>
          <ExpertProfileForm profile={expert} name={user.name} username={user.username} />
        </>
      )}
    </div>
  );
}
// import Link from "next/link";
// import { redirect } from "next/navigation";
// import { prisma } from "@/lib/prisma";
// import { requireUser } from "@/lib/user";
// import StudentProfileForm from "@/components/StudentProfileForm";
// import ExpertProfileForm from "@/components/ExpertProfileForm";

// export const dynamic = "force-dynamic";
// export const metadata = { title: "Edit profile | buncho" };

// export default async function ProfilePage() {
//   const user = await requireUser("/dashboard/profile");
//   if (!user.role) redirect("/onboarding");

//   const [student, expert] = await Promise.all([
//     user.role === "STUDENT" ? prisma.studentProfile.findUnique({ where: { userId: user.id } }) : null,
//     user.role === "EXPERT" ? prisma.expertProfile.findUnique({ where: { userId: user.id } }) : null,
//   ]);

//   return (
//     <div className="mx-auto max-w-2xl space-y-6">
//       <Link href="/dashboard" className="text-sm font-medium text-muted hover:text-ink">Back to dashboard</Link>
//       <h1 className="font-display text-3xl font-bold sm:text-4xl">Edit profile</h1>
//       {user.role === "STUDENT" ? (
//         <StudentProfileForm profile={student} name={user.name} username={user.username} />
//       ) : (
//         <>
//           <p className="text-sm text-muted">If you change your college, company or role, the Buncho team may re-check your verification.</p>
//           <ExpertProfileForm profile={expert} name={user.name} username={user.username} />
//         </>
//       )}
//     </div>
//   );
// }

import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser, isAdmin } from "@/lib/user";

export const dynamic = "force-dynamic";
export const metadata = { title: "Welcome | buncho" };

export default async function OnboardingPage() {
  const user = await requireUser("/onboarding");
  if (user.role) redirect("/dashboard");
  if (await isAdmin()) redirect("/admin"); // admin doesn't have to register

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold sm:text-4xl">Welcome to buncho</h1>
        <p className="mt-1 text-muted">How do you want to use buncho?</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
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
      </div>
    </div>
  );
}
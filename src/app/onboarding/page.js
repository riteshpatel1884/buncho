import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/user";

export const metadata = { title: "Get started | buncho" };

export default async function Onboarding() {
  const user = await requireUser("/onboarding");
  if (user.role) redirect("/dashboard");

  const options = [
    ["/onboarding/student", "I'm a student", "I want help with my resume, interviews, projects or career.", "Find experts"],
    ["/onboarding/expert", "I'm an expert", "I've done it, and I want to help others and earn.", "Become an expert"],
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold sm:text-4xl">How will you use Buncho?</h1>
        <p className="mt-2 text-muted">Pick one. It takes about two minutes.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {options.map(([href, title, text, cta], i) => (
          <Link key={href} href={href} className="card card-hover glow rise flex flex-col gap-3 p-6" style={{ "--i": i }}>
            <h2 className="font-display text-2xl font-bold">{title}</h2>
            <p className="text-muted">{text}</p>
            <span className="btn-primary mt-auto w-fit">{cta}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

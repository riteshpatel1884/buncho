import AuthShell from "@/components/AuthShell";
import ClerkAuth from "@/components/ClerkAuth";

export const metadata = { title: "Create account | buncho" };

export default function Page() {
  return (
    <AuthShell title="Get help from people who've done it" blurb="Create a free account as a student or an expert.">
      <ClerkAuth mode="sign-up" />
    </AuthShell>
  );
}

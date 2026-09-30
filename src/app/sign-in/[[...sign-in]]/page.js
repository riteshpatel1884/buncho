import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";

export const metadata = { title: "Sign in | buncho" };

export default function Page() {
  return (
    <AuthShell title="Welcome back" blurb="Sign in to upvote, comment and manage your launches.">
      <SignIn appearance={{ variables: { colorPrimary: "#d81b60", borderRadius: "0.75rem" } }} />
    </AuthShell>
  );
}

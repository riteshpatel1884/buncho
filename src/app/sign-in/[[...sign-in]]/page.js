import { SignIn } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";

export const metadata = { title: "Sign in | buncho" };

export default function Page() {
  return (
    <AuthShell title="Welcome back" blurb="Sign in to upvote, comment and manage your launches.">
      <SignIn appearance={{ variables: { colorPrimary: "#34d67b", colorBackground: "#0e1110", colorText: "#ecf3ee", colorTextSecondary: "#8a9a90", colorTextOnPrimaryBackground: "#04140a", colorInputBackground: "#161b18", colorInputText: "#ecf3ee", colorNeutral: "#ecf3ee", borderRadius: "0.75rem" } }} />
    </AuthShell>
  );
}
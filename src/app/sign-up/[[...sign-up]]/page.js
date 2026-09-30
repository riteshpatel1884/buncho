import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";

export const metadata = { title: "Create account | buncho" };

export default function Page() {
  return (
    <AuthShell title="Join the people building in India" blurb="Create a free account to launch your product and support other founders.">
      <SignUp appearance={{ variables: { colorPrimary: "#34d67b", colorBackground: "#0e1110", colorText: "#ecf3ee", colorTextSecondary: "#8a9a90", colorTextOnPrimaryBackground: "#04140a", colorInputBackground: "#161b18", colorInputText: "#ecf3ee", colorNeutral: "#ecf3ee", borderRadius: "0.75rem" } }} />
    </AuthShell>
  );
}
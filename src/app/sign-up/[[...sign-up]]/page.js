import { SignUp } from "@clerk/nextjs";
import AuthShell from "@/components/AuthShell";

export const metadata = { title: "Create account | buncho" };

export default function Page() {
  return (
    <AuthShell title="Join the people building in India" blurb="Create a free account to launch your product and support other founders.">
      <SignUp appearance={{ variables: { colorPrimary: "#d81b60", borderRadius: "0.75rem" } }} />
    </AuthShell>
  );
}

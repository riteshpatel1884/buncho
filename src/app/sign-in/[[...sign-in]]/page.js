import AuthShell from "@/components/AuthShell";
import ClerkAuth from "@/components/ClerkAuth";

export const metadata = { title: "Sign in | buncho" };

export default function Page() {
  return (
    <AuthShell title="Welcome back" blurb="Sign in to book sessions and manage your bookings.">
      <ClerkAuth mode="sign-in" />
    </AuthShell>
  );
}

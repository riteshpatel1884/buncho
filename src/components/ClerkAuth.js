"use client";
import { SignIn, SignUp } from "@clerk/nextjs";
import { useTheme, CLERK_VARS } from "@/lib/useTheme";

export default function ClerkAuth({ mode }) {
  const theme = useTheme();
  const appearance = { variables: CLERK_VARS[theme] };
  return mode === "sign-in" ? (
    <SignIn appearance={appearance} fallbackRedirectUrl="/dashboard" />
  ) : (
    <SignUp appearance={appearance} forceRedirectUrl="/onboarding" />
  );
}

// "use client";
// import { SignIn, SignUp } from "@clerk/nextjs";
// import { useTheme, CLERK_VARS } from "@/lib/useTheme";

// export default function ClerkAuth({ mode }) {
//   const theme = useTheme();
//   const appearance = { variables: CLERK_VARS[theme] };
//   return mode === "sign-in" ? (
//     <SignIn appearance={appearance} fallbackRedirectUrl="/dashboard" />
//   ) : (
//     <SignUp appearance={appearance} forceRedirectUrl="/onboarding" />
//   );
// }

"use client";
import { useEffect, useState } from "react";
import { SignIn, SignUp } from "@clerk/nextjs";
import { useTheme, CLERK_VARS } from "@/lib/useTheme";

// Reads ?redirect_url= and keeps it only if it points back to this site.
function readTarget() {
  try {
    const raw = new URLSearchParams(window.location.search).get("redirect_url");
    if (!raw) return null;
    const u = new URL(raw, window.location.origin);
    return u.origin === window.location.origin ? u.pathname + u.search : null;
  } catch {
    return null;
  }
}

export default function ClerkAuth({ mode }) {
  const theme = useTheme();
  const appearance = { variables: CLERK_VARS[theme] };

  // A brand new account has no role yet, so it must always land on the onboarding pages.
  // If the person came from "Become an expert" (/onboarding/expert) they go straight back there,
  // otherwise they go to /onboarding where they choose student or expert.
  const [signUpDest, setSignUpDest] = useState("/onboarding");
  const [signInDest, setSignInDest] = useState("/dashboard");
  useEffect(() => {
    const t = readTarget();
    if (t) setSignInDest(t);
    if (t && (t === "/onboarding" || t.startsWith("/onboarding/"))) setSignUpDest(t);
  }, []);

  return mode === "sign-in" ? (
    <SignIn
      appearance={appearance}
      forceRedirectUrl={signInDest}
      // New people who start on the sign-in screen (for example with Google) become sign-ups.
      signUpForceRedirectUrl={signUpDest}
    />
  ) : (
    <SignUp appearance={appearance} forceRedirectUrl={signUpDest} />
  );
}
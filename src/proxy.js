import { clerkMiddleware } from "@clerk/nextjs/server";

// Runs Clerk on every request so auth() works in pages and actions.
// Pages protect themselves (see lib/user.js), so no path matching is needed here.
// On Next.js 15 or older, name this file middleware.js instead.
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};

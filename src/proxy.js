import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
const isProtected = createRouteMatcher(['/dashboard(.*)', '/admin(.*)', '/api/admin(.*)', '/jobs(.*)', '/billing(.*)', '/report(.*)', '/settings(.*)']);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) await auth.protect();
});

export const config = {
  matcher: [
    // Skip Next.js internals and static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest|txt|xml)).*)',
    '/(api|trpc)(.*)',
  ],
};
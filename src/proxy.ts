import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/",
  "/register(.*)",
  "/sign-in(.*)",
  "/sign-up(.*)",
  "/market(.*)",
  "/store/(.*)",
  "/profile(.*)",
  "/api/webhooks(.*)",
  "/api/vendors(.*)",
  "/api/products(.*)",
  "/api/reviews(.*)",
]);

export default clerkMiddleware(async (_auth, _req) => {
  if (!isPublicRoute(_req)) {
    // await auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    // Always run for API routes
    "/(api|trpc)(.*)",
  ],
};

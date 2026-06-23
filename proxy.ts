import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isDashboardRoute = createRouteMatcher([
  "/dashboard(.*)",
]);

export default clerkMiddleware(async (auth, req) => {

    console.log("=== PROXY EJECUTADO ===", req.nextUrl.pathname);

  if (!isDashboardRoute(req)) {
    return NextResponse.next();
  }
  console.log("PROXY EJECUTADO", req.nextUrl.pathname);

  const { userId, redirectToSignIn } = await auth();

  if (!userId) {
    return redirectToSignIn({
      returnBackUrl: req.url,
    });
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!.*\\..*|_next).*)",
    "/",
    "/(api|trpc)(.*)",
  ],
};
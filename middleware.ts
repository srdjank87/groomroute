import { auth } from "@/lib/auth";
import { NextResponse } from "next/server";

export const runtime = "nodejs"; // Force Node.js runtime instead of Edge

export default auth((req) => {
  const { nextUrl } = req;
  const isAuthenticated = !!req.auth;

  const isAuthRoute = nextUrl.pathname.startsWith("/auth");
  const isProtectedRoute =
    nextUrl.pathname.startsWith("/dashboard") ||
    nextUrl.pathname.startsWith("/app") ||
    nextUrl.pathname.startsWith("/onboarding");
  const isSubscriptionRoute = nextUrl.pathname.startsWith("/subscription");

  // Allow access to auth routes
  if (isAuthRoute && !isAuthenticated) {
    return NextResponse.next();
  }

  // Redirect authenticated users away from auth routes
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  // Require authentication for protected routes
  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/signin", nextUrl));
  }

  // Check subscription status for app routes (but not onboarding or subscription pages)
  if (
    isAuthenticated &&
    nextUrl.pathname.startsWith("/app") &&
    !isSubscriptionRoute &&
    req.auth?.user
  ) {
    const subscriptionStatus = (req.auth.user as any).subscriptionStatus;

    // Allow access during trial or active subscription
    if (
      subscriptionStatus === "TRIAL" ||
      subscriptionStatus === "ACTIVE" ||
      subscriptionStatus === "PAST_DUE"
    ) {
      return NextResponse.next();
    }

    // Redirect to subscription page if canceled or incomplete
    if (
      subscriptionStatus === "CANCELED" ||
      subscriptionStatus === "INCOMPLETE"
    ) {
      return NextResponse.redirect(new URL("/subscription/expired", nextUrl));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/app/:path*",
    "/onboarding/:path*",
    "/auth/:path*",
    "/subscription/:path*",
  ],
};

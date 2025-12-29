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

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL("/auth/signin", nextUrl));
  }

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/app/:path*",
    "/onboarding/:path*",
    "/auth/:path*",
  ],
};

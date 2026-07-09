import NextAuth from "next-auth";
import { NextResponse } from "next/server";

import { authConfig } from "@/auth.config";

// In Next.js 16 the middleware file is `proxy.ts`. We instantiate a lightweight,
// edge-safe Auth.js instance (no DB providers) purely to read the session cookie.
const { auth } = NextAuth(authConfig);

const AUTH_PREFIX = "/auth";
const ADMIN_PREFIX = "/admin";

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = Boolean(req.auth?.user);
  const role = req.auth?.user?.role;

  const isAuthRoute = nextUrl.pathname.startsWith(AUTH_PREFIX);

  // Authenticated users should not see the login/sign-up pages.
  if (isAuthRoute) {
    if (isLoggedIn) {
      return NextResponse.redirect(new URL("/", nextUrl));
    }
    return NextResponse.next();
  }

  // Everything else requires authentication.
  if (!isLoggedIn) {
    const loginUrl = new URL("/auth/log-in", nextUrl);
    loginUrl.searchParams.set(
      "callbackUrl",
      nextUrl.pathname + nextUrl.search,
    );
    return NextResponse.redirect(loginUrl);
  }

  // Role-based access control for admin-only areas.
  if (nextUrl.pathname.startsWith(ADMIN_PREFIX) && role !== "admin") {
    return NextResponse.redirect(new URL("/", nextUrl));
  }

  return NextResponse.next();
});

export const config = {
  // Run on all routes except Next internals, the auth API, and static assets.
  matcher: [
    "/((?!api/auth|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};

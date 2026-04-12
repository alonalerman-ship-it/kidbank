import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE = "kidbank_auth";

export function middleware(request: NextRequest) {
  const sitePassword = process.env.KIDBANK_SITE_PASSWORD;

  // If no password is configured, allow all requests
  if (!sitePassword) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;

  // Always allow login page and auth API routes
  if (
    pathname === "/login" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/_next/")
  ) {
    return NextResponse.next();
  }

  // Check cookie — stored as plain password (app is HTTPS-only)
  const cookie = request.cookies.get(AUTH_COOKIE)?.value;
  if (cookie === sitePassword) {
    return NextResponse.next();
  }

  // Redirect to login
  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", pathname);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!.*\\..*).*)"],
};

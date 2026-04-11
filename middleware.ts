import { NextResponse, type NextRequest } from "next/server";

import { getSitePasswordToken } from "@/lib/auth";

const AUTH_COOKIE = "kidbank_site_auth";

export async function middleware(request: NextRequest) {
  const sitePassword = process.env.KIDBANK_SITE_PASSWORD;
  if (!sitePassword) {
    return NextResponse.next();
  }

  const { pathname } = request.nextUrl;
  const isAllowedPath =
    pathname === "/login" ||
    pathname.startsWith("/api/auth/") ||
    pathname.startsWith("/api/shortcut/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/favicon.ico";

  if (isAllowedPath) {
    return NextResponse.next();
  }

  const expectedToken = await getSitePasswordToken(sitePassword);
  if (request.cookies.get(AUTH_COOKIE)?.value === expectedToken) {
    return NextResponse.next();
  }

  const loginUrl = request.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("next", request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/((?!.*\\..*).*)", "/api/:path*"]
};

import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "kidbank_auth";

function getSafeRedirect(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}

// Behind Hostinger's reverse proxy, request.url shows the internal address
// (e.g. http://0.0.0.0:3000). Use forwarded headers to get the real public URL.
function getBaseUrl(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return new URL(request.url).origin;
}

export async function POST(request: NextRequest) {
  const sitePassword = process.env.KIDBANK_SITE_PASSWORD;
  const base = getBaseUrl(request);

  if (!sitePassword) {
    return NextResponse.redirect(new URL("/", base));
  }

  const formData = await request.formData();
  const password = formData.get("password");
  const nextPath = getSafeRedirect(formData.get("next"));

  if (password !== sitePassword) {
    const loginUrl = new URL("/login", base);
    loginUrl.searchParams.set("error", "1");
    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.redirect(new URL(nextPath, base));
  response.cookies.set(AUTH_COOKIE, sitePassword, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

import { NextRequest, NextResponse } from "next/server";

const AUTH_COOKIE = "kidbank_auth";

function getSafeRedirect(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//")) {
    return "/";
  }
  return value;
}

export async function POST(request: NextRequest) {
  const sitePassword = process.env.KIDBANK_SITE_PASSWORD;
  if (!sitePassword) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  const formData = await request.formData();
  const password = formData.get("password");
  const nextPath = getSafeRedirect(formData.get("next"));

  if (password !== sitePassword) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("error", "1");
    loginUrl.searchParams.set("next", nextPath);
    return NextResponse.redirect(loginUrl);
  }

  const response = NextResponse.redirect(new URL(nextPath, request.url));
  response.cookies.set(AUTH_COOKIE, sitePassword, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return response;
}

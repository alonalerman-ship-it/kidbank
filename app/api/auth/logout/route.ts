import { NextRequest, NextResponse } from "next/server";

export function POST(request: NextRequest) {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete("kidbank_site_auth");
  return response;
}

import { NextRequest, NextResponse } from "next/server";

import { handleApiError, unauthorized } from "@/lib/server/api";
import { store } from "@/lib/server/store";
import { loanSchema } from "@/lib/validators";

function isAuthorized(request: NextRequest) {
  const token = request.headers.get("x-shortcut-secret") ?? request.nextUrl.searchParams.get("secret");
  return token === store.getShortcutSecret();
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return unauthorized();
    }
    const payload = loanSchema.parse(await request.json());
    return NextResponse.json(await store.createLoan(payload), { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

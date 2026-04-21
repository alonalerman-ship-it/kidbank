import { NextRequest, NextResponse } from "next/server";

import { handleApiError, unauthorized } from "@/lib/server/api";
import { store } from "@/lib/server/store";
import { loanSchema } from "@/lib/validators";

function isAuthorized(request: NextRequest) {
  const token = request.headers.get("x-shortcut-secret") ?? request.nextUrl.searchParams.get("secret");
  return token === store.getShortcutSecret();
}

function getQueryPayload(request: NextRequest) {
  return loanSchema.parse({
    borrowerName: request.nextUrl.searchParams.get("borrowerName"),
    amount: request.nextUrl.searchParams.get("amount"),
    purpose: request.nextUrl.searchParams.get("purpose"),
    annualInterestRate: request.nextUrl.searchParams.get("annualInterestRate") ?? undefined,
  });
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return unauthorized();
    }

    const payload = getQueryPayload(request);
    const loan = await store.createLoan(payload);
    return NextResponse.json(
      {
        ok: true,
        message: `Loan logged for ${loan.borrowerName}`,
        loan,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return unauthorized();
    }
    const payload = loanSchema.parse(await request.json());
    const loan = await store.createLoan(payload);
    return NextResponse.json(
      {
        ok: true,
        message: `Loan logged for ${loan.borrowerName}`,
        loan,
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

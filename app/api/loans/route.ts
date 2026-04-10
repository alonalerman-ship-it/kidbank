import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api";
import { store } from "@/lib/server/store";
import { loanSchema } from "@/lib/validators";

export async function GET() {
  return NextResponse.json(await store.getLoans());
}

export async function POST(request: NextRequest) {
  try {
    const payload = loanSchema.parse(await request.json());
    const loan = await store.createLoan(payload);
    return NextResponse.json(loan, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api";
import { store } from "@/lib/server/store";
import { expenseSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const payload = expenseSchema.parse(await request.json());
    const transaction = await store.logExpense(payload.amount, payload.description);
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

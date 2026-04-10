import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api";
import { store } from "@/lib/server/store";
import { incomeSchema } from "@/lib/validators";

export async function POST(request: NextRequest) {
  try {
    const payload = incomeSchema.parse(await request.json());
    const transaction = await store.logIncome(
      payload.amount,
      payload.description,
      payload.source === "repayment" ? "loan_repayment" : payload.source === "chore" ? "chore_reward" : "income"
    );
    return NextResponse.json(transaction, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

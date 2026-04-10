import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api";
import { store } from "@/lib/server/store";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await store.repayLoan(id);
    return NextResponse.json(result);
  } catch (error) {
    return handleApiError(error);
  }
}

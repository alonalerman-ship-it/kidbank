import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api";
import { store } from "@/lib/server/store";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ completionId: string }> }) {
  try {
    const { completionId } = await params;
    const completion = await store.approveChore(completionId);
    return NextResponse.json(completion);
  } catch (error) {
    return handleApiError(error);
  }
}

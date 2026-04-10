import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api";
import { store } from "@/lib/server/store";

export async function POST(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const completion = await store.completeChore(id);
    return NextResponse.json(completion, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}

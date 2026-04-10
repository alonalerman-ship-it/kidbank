import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api";
import { store } from "@/lib/server/store";
import { monthlyNoteSchema } from "@/lib/validators";

export async function POST(request: NextRequest, { params }: { params: Promise<{ month: string }> }) {
  try {
    const { month } = await params;
    const body = request.headers.get("content-type")?.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
    const payload = monthlyNoteSchema.parse(body);
    return NextResponse.json(await store.setMonthlyNote(month, payload.note));
  } catch (error) {
    return handleApiError(error);
  }
}

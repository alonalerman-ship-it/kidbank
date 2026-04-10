import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api";
import { store } from "@/lib/server/store";
import { reflectionSchema } from "@/lib/validators";

export async function POST(request: NextRequest, { params }: { params: Promise<{ transactionId: string }> }) {
  try {
    const { transactionId } = await params;
    const body = request.headers.get("content-type")?.includes("application/json")
      ? await request.json()
      : Object.fromEntries((await request.formData()).entries());
    const payload = reflectionSchema.parse(body);
    return NextResponse.json(await store.setReflection(transactionId, payload.verdict));
  } catch (error) {
    return handleApiError(error);
  }
}

import { NextRequest, NextResponse } from "next/server";

import { store } from "@/lib/server/store";

export async function GET(_request: NextRequest, { params }: { params: Promise<{ month: string }> }) {
  const { month } = await params;
  return NextResponse.json(await store.getReflect(month));
}

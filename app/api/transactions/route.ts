import { NextRequest, NextResponse } from "next/server";

import { store } from "@/lib/server/store";

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type") ?? undefined;
  const bucket = request.nextUrl.searchParams.get("bucket") ?? undefined;
  return NextResponse.json(await store.getTransactions({ type: type as never, bucket: bucket as never }));
}

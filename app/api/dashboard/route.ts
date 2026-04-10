import { NextResponse } from "next/server";

import { store } from "@/lib/server/store";

export async function GET() {
  return NextResponse.json(await store.getDashboard());
}

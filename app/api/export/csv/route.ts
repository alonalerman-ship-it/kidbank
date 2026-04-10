import { NextResponse } from "next/server";

import { store } from "@/lib/server/store";

export async function GET() {
  return new NextResponse(await store.exportCsv(), {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": 'attachment; filename="kidbank-transactions.csv"'
    }
  });
}

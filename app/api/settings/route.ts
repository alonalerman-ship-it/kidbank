import { NextRequest, NextResponse } from "next/server";

import { handleApiError } from "@/lib/server/api";
import { store } from "@/lib/server/store";
import { settingsSchema } from "@/lib/validators";

export async function GET() {
  return NextResponse.json(await store.getSettings());
}

export async function PATCH(request: NextRequest) {
  try {
    const payload = settingsSchema.parse(await request.json());
    return NextResponse.json(await store.updateSettings(payload));
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const payload = settingsSchema.parse({
      childName: formData.get("childName"),
      percentages: {
        spend: Number(formData.get("spend")),
        save: Number(formData.get("save")),
        invest: Number(formData.get("invest")),
        give: Number(formData.get("give"))
      },
      defaultLoanInterestRate: Number(formData.get("defaultLoanInterestRate"))
    });
    return NextResponse.json(await store.updateSettings(payload));
  } catch (error) {
    return handleApiError(error);
  }
}

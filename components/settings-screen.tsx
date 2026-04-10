import Link from "next/link";

import { Card } from "@/components/card";
import { SectionTitle } from "@/components/section-title";
import { SettingsForm } from "@/components/settings-form";
import { store } from "@/lib/server/store";

export async function SettingsScreen() {
  const settings = await store.getSettings();

  return (
    <div className="space-y-5 pb-28">
      <Card>
        <SectionTitle eyebrow="Parent controls" title="Bucket Settings" />
        <SettingsForm settings={settings} />
      </Card>
      <Card>
        <SectionTitle eyebrow="Tools" title="Extra actions" />
        <div className="mt-4 flex flex-col gap-3">
          <Link href="/simulator" className="rounded-full bg-mint px-4 py-4 text-center font-semibold text-emerald">
            Open investment simulator
          </Link>
          <a href="/api/export/csv" className="rounded-full bg-surfaceLow px-4 py-4 text-center font-semibold text-ink">
            Export CSV
          </a>
        </div>
      </Card>
    </div>
  );
}

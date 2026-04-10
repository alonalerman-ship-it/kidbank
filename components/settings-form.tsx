"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { Settings } from "@/lib/types";

export function SettingsForm({ settings }: { settings: Settings }) {
  const router = useRouter();
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  return (
    <form
      className="mt-4 space-y-3"
      onSubmit={(event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
          const response = await fetch("/api/settings", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              childName: formData.get("childName"),
              percentages: {
                spend: Number(formData.get("spend")),
                save: Number(formData.get("save")),
                invest: Number(formData.get("invest")),
                give: Number(formData.get("give"))
              },
              defaultLoanInterestRate: Number(formData.get("defaultLoanInterestRate"))
            })
          });
          const data = await response.json().catch(() => null);
          if (!response.ok) {
            setStatus(data?.error ?? "Could not save settings");
            return;
          }
          setStatus("Settings saved");
          router.refresh();
        });
      }}
    >
      <input name="childName" defaultValue={settings.childName} className="w-full rounded-[22px] border-2 border-transparent bg-surfaceLow px-4 py-3 focus:border-mint" />
      {(["spend", "save", "invest", "give"] as const).map((bucket) => (
        <label key={bucket} className="block">
          <span className="mb-2 block text-sm font-semibold capitalize">{bucket}</span>
          <input
            type="number"
            min="0"
            max="100"
            name={bucket}
            defaultValue={settings.percentages[bucket]}
            className="w-full rounded-[22px] border-2 border-transparent bg-surfaceLow px-4 py-3 focus:border-mint"
          />
        </label>
      ))}
      <label className="block">
        <span className="mb-2 block text-sm font-semibold">Default loan interest rate</span>
        <input
          type="number"
          min="0"
          max="100"
          name="defaultLoanInterestRate"
          defaultValue={settings.defaultLoanInterestRate}
          className="w-full rounded-[22px] border-2 border-transparent bg-surfaceLow px-4 py-3 focus:border-mint"
        />
      </label>
      <button className="w-full rounded-full bg-emerald px-4 py-4 font-semibold text-white shadow-lg shadow-emerald/20" disabled={isPending}>
        {isPending ? "Saving..." : "Save settings"}
      </button>
      {status ? <p className="text-sm text-mutedInk">{status}</p> : null}
    </form>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import type { BucketBalance } from "@/lib/types";
import { formatCurrency, getSplitAllocation } from "@/lib/utils";

type IncomeScreenProps = {
  bucketBalances: BucketBalance[];
  percentages: {
    spend: number;
    save: number;
    invest: number;
    give: number;
  };
};

const quickTags = [
  { label: "🎁 Gift", value: "Gift from Grandma" },
  { label: "🧹 Chores", value: "Chore payment" },
  { label: "💡 Allowance", value: "Weekly allowance" }
];

export function IncomeScreen({ bucketBalances, percentages }: IncomeScreenProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const numericAmount = Number(amount || 0);
  const splitPreview = useMemo(() => {
    if (!numericAmount) {
      return [];
    }
    return getSplitAllocation(numericAmount, percentages);
  }, [numericAmount, percentages]);

  const saveBucket = bucketBalances.find((bucket) => bucket.bucket === "save")?.balance ?? 0;
  const goalTarget = 150;
  const projectedSave = saveBucket + (splitPreview.find((item) => item.bucket === "save")?.amount ?? 0);
  const goalProgress = Math.min(100, Math.round((projectedSave / goalTarget) * 100));

  return (
    <div className="space-y-8 pb-28">
      <section className="text-center">
        <div className="inline-flex items-center gap-2 rounded-full bg-mint px-4 py-2 shadow-soft">
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#1f6223]">Log Transaction</span>
        </div>
        <h1 className="mt-4 font-display text-[3.25rem] font-extrabold leading-tight text-emerald">Income 💰</h1>
        <p className="mt-2 text-lg font-medium text-mutedInk">Adding money to your vault</p>
      </section>

      <div className="relative">
        <div className="absolute inset-0 translate-x-2 translate-y-2 rotate-2 rounded-[28px] bg-emerald/10" />
        <form
          className="relative space-y-8 rounded-[28px] border border-white/60 bg-surfaceLowest p-8 shadow-card"
          onSubmit={(event) => {
            event.preventDefault();
            startTransition(async () => {
              const response = await fetch("/api/transactions/income", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: numericAmount, description })
              });
              const data = await response.json().catch(() => null);
              if (!response.ok) {
                setStatus(data?.error ?? "Could not save income");
                return;
              }
              router.push("/");
              router.refresh();
            });
          }}
        >
          <div className="flex flex-col items-center">
            <label className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-emerald">Amount</label>
            <div className="flex w-full items-center justify-center gap-2">
              <span className="font-display text-5xl font-bold text-emerald/50">₪</span>
              <input
                autoFocus
                type="number"
                min="0"
                step="0.01"
                value={amount}
                onChange={(event) => setAmount(event.target.value)}
                placeholder="0.00"
                className="w-full bg-transparent p-0 text-center font-display text-7xl font-bold text-ink placeholder:text-surfaceHigh"
              />
            </div>
          </div>

          <div className="space-y-3">
            <label className="px-4 text-sm font-bold uppercase tracking-[0.2em] text-mutedInk">What&apos;s it for?</label>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="e.g. Birthday money from Grandma"
              className="w-full resize-none rounded-[20px] bg-surfaceHigh p-6 text-lg"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {quickTags.map((tag) => (
              <button
                key={tag.label}
                type="button"
                onClick={() => setDescription(tag.value)}
                className="rounded-full border border-outlineSoft/20 bg-surfaceLow px-4 py-2 text-sm font-semibold text-mutedInk transition hover:bg-mint hover:text-[#1f6223]"
              >
                {tag.label}
              </button>
            ))}
          </div>

          <div className="rounded-[20px] bg-surfaceLow p-5">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-mutedInk">How it will split</p>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {(["spend", "save", "invest", "give"] as const).map((bucket) => {
                const amountForBucket = splitPreview.find((item) => item.bucket === bucket)?.amount ?? 0;
                return (
                  <div key={bucket} className="rounded-[18px] bg-surfaceLowest p-4">
                    <p className="text-xs font-bold uppercase tracking-[0.2em] text-mutedInk">{bucket}</p>
                    <p className="mt-2 font-display text-2xl font-bold text-ink">{formatCurrency(amountForBucket)}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={isPending || numericAmount <= 0 || description.trim().length < 2}
              className="flex h-20 w-full items-center justify-center gap-3 rounded-full bg-emerald text-xl font-extrabold text-white shadow-lg shadow-emerald/20 transition active:scale-95 disabled:opacity-60"
            >
              {isPending ? "Saving..." : "Split Money"}
            </button>
            <div className="flex h-14 w-full items-center justify-center rounded-full bg-peach/70 px-6 text-center text-sm font-bold text-[#614100]">
              Split rules stay fixed so habits stay consistent
            </div>
            {status ? <p className="text-center text-sm font-medium text-coral">{status}</p> : null}
          </div>
        </form>
      </div>

      <div className="rounded-[20px] border-l-4 border-emerald bg-surfaceLow p-6">
        <div className="flex items-start gap-4">
          <div className="text-2xl text-emerald">✦</div>
          <div>
            <h3 className="font-display text-2xl font-bold text-ink">Saving Goal Boost</h3>
            <p className="mt-1 text-sm leading-relaxed text-mutedInk">
              Adding {formatCurrency(numericAmount || 0)} will bring savings to {goalProgress}% of the new bike goal.
            </p>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-surfaceHigh">
              <div className="h-full rounded-full bg-gradient-to-r from-emerald to-mint" style={{ width: `${goalProgress}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

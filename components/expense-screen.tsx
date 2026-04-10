"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { BucketBalance } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type ExpenseScreenProps = {
  bucketBalances: BucketBalance[];
};

export function ExpenseScreen({ bucketBalances }: ExpenseScreenProps) {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const spendBucket = bucketBalances.find((bucket) => bucket.bucket === "spend")?.balance ?? 0;
  const saveBucket = bucketBalances.find((bucket) => bucket.bucket === "save")?.balance ?? 0;
  const numericAmount = Number(amount || 0);

  return (
    <div className="space-y-8 pb-28">
      <section className="text-center">
        <span className="inline-block rounded-full bg-peach px-4 py-1 text-xs font-bold uppercase tracking-[0.24em] text-[#614100]">
          New Transaction
        </span>
        <h1 className="mt-4 text-4xl font-bold tracking-tight text-ink">Expense 💸</h1>
        <p className="mt-2 text-sm text-mutedInk">Where did the money go today?</p>
      </section>

      <form
        className="space-y-8"
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(async () => {
            const response = await fetch("/api/transactions/expense", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ amount: numericAmount, description })
            });
            const data = await response.json().catch(() => null);
            if (!response.ok) {
              setStatus(data?.error ?? "Could not save expense");
              return;
            }
            router.push("/history");
            router.refresh();
          });
        }}
      >
        <div className="rounded-[28px] bg-surfaceLow px-6 py-8">
          <label className="mb-2 block text-center text-xs font-bold uppercase tracking-[0.24em] text-[#7b5400]">Amount</label>
          <div className="flex items-center justify-center text-[#7b5400]">
            <span className="mr-2 font-display text-4xl font-bold">₪</span>
            <input
              autoFocus
              type="number"
              min="0"
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
              className="w-full bg-transparent text-center font-display text-6xl font-extrabold placeholder:text-[#6b4900]/20"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="block px-4 text-xs font-bold uppercase tracking-[0.24em] text-mutedInk">Description</label>
          <div className="rounded-[20px] bg-surfaceHigh p-1">
            <textarea
              rows={2}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Giant Cupcake 🧁"
              className="w-full resize-none bg-transparent p-4 text-lg font-medium"
            />
          </div>
        </div>

        <div className="space-y-4">
          <label className="block px-4 text-xs font-bold uppercase tracking-[0.24em] text-mutedInk">Select Bucket</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative rounded-[20px] border-2 border-transparent bg-mint p-5 text-left text-[#1f6223]">
              <span className="mb-3 block text-3xl">💵</span>
              <span className="block text-lg font-bold">Available</span>
              <span className="mt-1 block text-xs font-medium opacity-80">{formatCurrency(spendBucket)}</span>
              <div className="absolute right-3 top-3 text-sm opacity-70">●</div>
            </div>
            <div className="rounded-[20px] bg-surfaceHigh p-5 text-left text-mutedInk grayscale">
              <span className="mb-3 block text-3xl">🐖</span>
              <span className="block text-lg font-bold">Savings</span>
              <span className="mt-1 block text-xs font-medium opacity-70">{formatCurrency(saveBucket)}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-[20px] bg-peach/15 p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-peach text-[#614100]">💡</div>
          <p className="text-xs font-bold leading-relaxed text-[#6c4a00]">
            Smart Tip: this version logs spending against the Available bucket so the habit stays simple.
          </p>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isPending || numericAmount <= 0 || description.trim().length < 2}
            className="flex h-20 w-full items-center justify-center gap-3 rounded-full bg-[#7b5400] text-xl font-bold text-white shadow-xl shadow-[#7b5400]/20 transition active:scale-95 disabled:opacity-60"
          >
            {isPending ? "Saving..." : "Confirm Expense"}
          </button>
          {status ? <p className="mt-3 text-center text-sm font-medium text-coral">{status}</p> : null}
        </div>
      </form>
    </div>
  );
}

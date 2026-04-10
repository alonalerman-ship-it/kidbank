"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import type { ReflectionVerdict, Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export function ReflectCard({
  transaction,
  initialVerdict
}: {
  transaction: Transaction;
  initialVerdict?: ReflectionVerdict;
}) {
  const router = useRouter();
  const [verdict, setVerdict] = useState<ReflectionVerdict | undefined>(initialVerdict);
  const [isPending, startTransition] = useTransition();

  const setReflection = (nextVerdict: ReflectionVerdict) => {
    startTransition(async () => {
      const response = await fetch(`/api/reflect-transactions/${transaction.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ verdict: nextVerdict })
      });
      if (response.ok) {
        setVerdict(nextVerdict);
        router.refresh();
      }
    });
  };

  return (
    <section className="relative rounded-panel border border-white/60 bg-surfaceLow p-5 shadow-card">
      <div className="absolute -right-2 -top-3 rounded-full bg-peach px-4 py-1 text-[10px] font-extrabold uppercase tracking-[0.24em] text-[#614100]">
        Latest Reflection
      </div>
      <div className="mt-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-lg font-semibold">{transaction.description}</p>
          <p className="text-sm text-mutedInk">{new Date(transaction.occurredAt).toLocaleDateString()}</p>
        </div>
        <p className="font-semibold text-coral">{formatCurrency(transaction.amount)}</p>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled={isPending}
          onClick={() => setReflection("worth_it")}
          className={`rounded-full px-4 py-3 text-sm font-semibold ${verdict === "worth_it" ? "bg-mint text-emerald" : "bg-surfaceHigh text-mutedInk"}`}
        >
          Worth It
        </button>
        <button
          type="button"
          disabled={isPending}
          onClick={() => setReflection("not_worth_it")}
          className={`rounded-full px-4 py-3 text-sm font-semibold ${verdict === "not_worth_it" ? "bg-peach text-[#614100]" : "bg-surfaceHigh text-mutedInk"}`}
        >
          Not Worth It
        </button>
      </div>
    </section>
  );
}

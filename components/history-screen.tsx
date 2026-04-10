"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowDownRight, ArrowUpRight, Candy, CircleDollarSign, Gift, ScrollText, Sprout } from "lucide-react";

import type { Transaction } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

type FilterKey = "everything" | "spending" | "savings" | "gifts";

const filterOptions: Array<{ key: FilterKey; label: string }> = [
  { key: "everything", label: "Everything" },
  { key: "spending", label: "Spending" },
  { key: "savings", label: "Savings" },
  { key: "gifts", label: "Gifts" }
];

export function HistoryScreen({ transactions }: { transactions: Transaction[] }) {
  const [activeFilter, setActiveFilter] = useState<FilterKey>("everything");

  const filteredTransactions = useMemo(() => {
    return transactions.filter((transaction) => {
      const lower = transaction.description.toLowerCase();
      if (activeFilter === "spending") {
        return transaction.type === "expense";
      }
      if (activeFilter === "savings") {
        return transaction.type === "chore_reward" || transaction.bucket === "save" || lower.includes("allowance") || lower.includes("save");
      }
      if (activeFilter === "gifts") {
        return lower.includes("gift") || lower.includes("grandma");
      }
      return true;
    });
  }, [activeFilter, transactions]);

  const grouped = useMemo(() => {
    return filteredTransactions.reduce<Record<string, Transaction[]>>((acc, transaction) => {
      const date = new Date(transaction.occurredAt);
      const diffDays = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
      const label = diffDays <= 0 ? "Today" : diffDays <= 7 ? "Last Week" : "Earlier";
      acc[label] ??= [];
      acc[label].push(transaction);
      return acc;
    }, {});
  }, [filteredTransactions]);

  const metaForTransaction = (transaction: Transaction) => {
    const lower = transaction.description.toLowerCase();
    if (transaction.type === "reflection_note") {
      return {
        icon: ScrollText,
        iconClass: "bg-surfaceHigh text-ink",
        chip: "Reflection",
        chipClass: "bg-surfaceHigh text-mutedInk"
      };
    }
    if (lower.includes("mow")) {
      return { icon: Sprout, iconClass: "bg-mint text-emerald", chip: "Savings", chipClass: "bg-mint/40 text-emerald" };
    }
    if (lower.includes("grandma") || lower.includes("gift")) {
      return { icon: Gift, iconClass: "bg-sky/40 text-[#004aad]", chip: "Gift", chipClass: "bg-sky/25 text-[#004aad]" };
    }
    if (lower.includes("allowance") || transaction.amount > 0) {
      return { icon: CircleDollarSign, iconClass: "bg-mint/40 text-emerald", chip: "Income", chipClass: "bg-mint/30 text-emerald" };
    }
    return { icon: Candy, iconClass: "bg-peach/50 text-[#6b4900]", chip: "Available", chipClass: "bg-peach/40 text-[#7b5400]" };
  };

  return (
    <div className="space-y-5 pb-28">
      <section className="mb-2">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.24em] text-emerald/80">Transaction feed</p>
            <h2 className="font-display text-[2rem] font-extrabold tracking-tight text-ink">History</h2>
          </div>
          <Link href="/api/export/csv" className="rounded-full bg-surfaceHigh px-4 py-2 text-sm font-medium text-mutedInk">
            Export CSV
          </Link>
        </div>
      </section>
      <div className="flex gap-2 overflow-x-auto pb-2 text-sm">
        {filterOptions.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setActiveFilter(filter.key)}
            className={`whitespace-nowrap rounded-full px-6 py-3 font-bold transition ${activeFilter === filter.key ? "bg-emerald text-white" : "bg-surfaceHigh text-mutedInk"}`}
          >
            {filter.label}
          </button>
        ))}
      </div>
      {Object.entries(grouped).map(([label, items]) => (
        <section key={label} className="space-y-4">
          <div className="pt-4">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-outlineSoft">{label}</p>
          </div>
          {items.map((transaction) => {
            const meta = metaForTransaction(transaction);
            const Icon = meta.icon;
            return (
              <div key={transaction.id} className="flex items-center justify-between rounded-[20px] bg-surfaceLowest p-5 shadow-soft transition-colors hover:bg-white">
                <div className="flex items-center gap-4">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-[18px] ${meta.iconClass}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-ink">{transaction.description}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${meta.chipClass}`}>{meta.chip}</span>
                      <span className="text-xs text-mutedInk">{new Date(transaction.occurredAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-xl font-black tracking-tight ${transaction.amount >= 0 ? "text-emerald" : "text-coral"}`}>
                    {transaction.amount === 0 ? "Note" : formatCurrency(transaction.amount)}
                  </p>
                  {transaction.amount >= 0 ? <ArrowUpRight className="ml-auto h-4 w-4 text-emerald/60" /> : <ArrowDownRight className="ml-auto h-4 w-4 text-coral/60" />}
                </div>
              </div>
            );
          })}
        </section>
      ))}
      {filteredTransactions.length === 0 ? (
        <div className="py-10 text-center opacity-50">
          <p className="text-sm font-medium">No items match this filter yet.</p>
        </div>
      ) : (
        <div className="py-10 text-center opacity-40">
          <p className="text-sm font-medium">End of recent history</p>
        </div>
      )}
    </div>
  );
}

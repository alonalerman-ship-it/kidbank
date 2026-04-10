"use client";

import { useMemo, useState } from "react";

import { Card } from "@/components/card";
import { SectionTitle } from "@/components/section-title";
import { formatCurrency } from "@/lib/utils";

export function SimulatorScreen() {
  const [amount, setAmount] = useState(50);
  const scenarios = useMemo(
    () =>
      [1, 5, 10].map((years) => ({
        years,
        value: Number((amount * Math.pow(1.06, years)).toFixed(2))
      })),
    [amount]
  );

  return (
    <div className="space-y-5 pb-28">
      <Card>
        <SectionTitle eyebrow="Grow My Money" title="Investment Simulator" />
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-2 block text-sm font-semibold">Starting amount</span>
            <input
              type="number"
              value={amount}
              min="1"
              step="1"
              onChange={(event) => setAmount(Number(event.target.value))}
              className="w-full rounded-[22px] border-0 bg-slate-50 px-4 py-3"
            />
          </label>
          <p className="text-sm text-slate-500">This uses a simple 6% yearly growth example so investing feels easy to understand.</p>
        </div>
      </Card>
      {scenarios.map((scenario) => (
        <Card key={scenario.years}>
          <p className="text-xs uppercase tracking-[0.24em] text-slate-500">In {scenario.years} year{scenario.years === 1 ? "" : "s"}</p>
          <p className="mt-3 font-display text-5xl font-bold text-emerald">{formatCurrency(scenario.value)}</p>
        </Card>
      ))}
    </div>
  );
}

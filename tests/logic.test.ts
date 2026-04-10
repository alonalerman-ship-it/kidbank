import { describe, expect, it } from "vitest";

import { initialState } from "@/lib/seed-data";
import { calculateSimpleInterest, getCurrentMonthKey, getReflectionCandidates, getSplitAllocation, validatePercentages } from "@/lib/utils";

describe("money logic", () => {
  it("validates percentages add to 100", () => {
    expect(validatePercentages({ spend: 50, save: 20, invest: 20, give: 10 })).toBe(true);
    expect(validatePercentages({ spend: 40, save: 20, invest: 20, give: 10 })).toBe(false);
  });

  it("splits income across all buckets", () => {
    expect(getSplitAllocation(10, { spend: 50, save: 20, invest: 20, give: 10 })).toEqual([
      { bucket: "spend", amount: 5 },
      { bucket: "save", amount: 2 },
      { bucket: "invest", amount: 2 },
      { bucket: "give", amount: 1 }
    ]);
  });

  it("computes simple interest by elapsed days", () => {
    expect(calculateSimpleInterest(20, 5, "2025-01-01T00:00:00.000Z", "2026-01-01T00:00:00.000Z")).toBeCloseTo(1, 1);
  });

  it("picks only current month expense transactions for reflection", () => {
    const monthKey = getCurrentMonthKey();
    const results = getReflectionCandidates(initialState.transactions);
    expect(results.every((transaction) => transaction.type === "expense")).toBe(true);
    expect(results.some((transaction) => transaction.occurredAt.startsWith(monthKey))).toBe(true);
  });
});

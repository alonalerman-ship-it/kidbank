import { clsx } from "clsx";
import { endOfMonth, format, isWithinInterval, startOfMonth } from "date-fns";

import type { BucketBalance, BucketKey, Reflection, Settings, Transaction } from "@/lib/types";

export function cn(...values: Array<string | false | null | undefined>) {
  return clsx(values);
}

export function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 2
  }).format(value);
}

export function getTotalBalance(buckets: BucketBalance[]) {
  return buckets.reduce((sum, entry) => sum + entry.balance, 0);
}

export function validatePercentages(percentages: Settings["percentages"]) {
  const total = Object.values(percentages).reduce((sum, value) => sum + value, 0);
  return total === 100;
}

export function getSplitAllocation(amount: number, percentages: Record<BucketKey, number>) {
  const buckets = Object.entries(percentages) as Array<[BucketKey, number]>;
  let remainder = amount;

  return buckets.map(([bucket, percentage], index) => {
    const raw = index === buckets.length - 1 ? remainder : Number(((amount * percentage) / 100).toFixed(2));
    remainder = Number((remainder - raw).toFixed(2));
    return { bucket, amount: raw };
  });
}

export function calculateSimpleInterest(principal: number, annualRate: number, borrowedAt: string, endDate?: string) {
  const start = new Date(borrowedAt).getTime();
  const end = new Date(endDate ?? new Date().toISOString()).getTime();
  const elapsedDays = Math.max(0, Math.floor((end - start) / (1000 * 60 * 60 * 24)));
  const interest = principal * (annualRate / 100) * (elapsedDays / 365);
  return Number(interest.toFixed(2));
}

export function getCurrentMonthKey(reference = new Date()) {
  return format(reference, "yyyy-MM");
}

export function getCurrentMonthDateRange(reference = new Date()) {
  const target = reference;
  return {
    start: startOfMonth(target),
    end: endOfMonth(target)
  };
}

export function getReflectionCandidates(transactions: Transaction[]) {
  const { start, end } = getCurrentMonthDateRange();
  return transactions.filter((transaction) => {
    if (transaction.type !== "expense") {
      return false;
    }
    const occurredAt = new Date(transaction.occurredAt);
    return isWithinInterval(occurredAt, { start, end });
  });
}

export function getReflectionProgress(transactions: Transaction[], reflections: Reflection[]) {
  const candidates = getReflectionCandidates(transactions);
  const monthKey = getCurrentMonthKey();
  const completed = reflections.filter((item) => item.monthKey === monthKey).length;
  const total = candidates.length;
  return {
    monthKey,
    completed,
    total,
    percentage: total === 0 ? 100 : Math.round((completed / total) * 100)
  };
}

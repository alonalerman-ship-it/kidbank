"use client";

import { useState, useTransition } from "react";

type FormKind = "income" | "expense" | "loan";

const endpointMap: Record<FormKind, string> = {
  income: "/api/transactions/income",
  expense: "/api/transactions/expense",
  loan: "/api/loans"
};

export function ActionForm({ kind }: { kind: FormKind }) {
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const buttonLabel = kind === "income" ? "Log income" : kind === "expense" ? "Log spending" : "Create loan";

  return (
    <form
      className="space-y-3 rounded-[28px] bg-surfaceLow p-4"
      onSubmit={(event) => {
        event.preventDefault();
        const form = event.currentTarget;
        const formData = new FormData(form);
        startTransition(async () => {
          const payload =
            kind === "loan"
              ? {
                  borrowerName: formData.get("borrowerName"),
                  amount: formData.get("amount"),
                  purpose: formData.get("description"),
                  ...(String(formData.get("annualInterestRate") ?? "").trim()
                    ? { annualInterestRate: formData.get("annualInterestRate") }
                    : {})
                }
              : {
                  amount: formData.get("amount"),
                  description: formData.get("description")
                };
          const response = await fetch(endpointMap[kind], {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          });
          if (!response.ok) {
            const data = await response.json();
            setStatus(data.error ?? "Could not save");
            return;
          }
          setStatus(kind === "income" ? "Income logged" : kind === "expense" ? "Expense logged" : "Loan added");
          form.reset();
        });
      }}
    >
      {kind === "loan" ? (
        <input
          name="borrowerName"
          placeholder="Who borrowed?"
          className="w-full rounded-2xl border-2 border-transparent bg-surfaceLowest px-4 py-3 font-medium focus:border-mint"
        />
      ) : null}
      <input
        name="description"
        placeholder={kind === "loan" ? "Purpose" : "Description"}
        className="w-full rounded-2xl border-2 border-transparent bg-surfaceLowest px-4 py-3 font-medium focus:border-mint"
      />
      <input
        name="amount"
        type="number"
        min="0"
        step="0.01"
        placeholder="Amount"
        className="w-full rounded-2xl border-2 border-transparent bg-surfaceLowest px-4 py-3 font-medium focus:border-mint"
      />
      {kind === "loan" ? (
        <input
          name="annualInterestRate"
          type="number"
          min="0"
          max="100"
          step="0.1"
          placeholder="Interest rate %"
          className="w-full rounded-2xl border-2 border-transparent bg-surfaceLowest px-4 py-3 font-medium focus:border-mint"
        />
      ) : null}
      <button
        type="submit"
        disabled={isPending}
        className="w-full rounded-full bg-emerald px-4 py-4 font-bold text-white shadow-lg shadow-emerald/20 disabled:opacity-60"
      >
        {isPending ? "Saving..." : buttonLabel}
      </button>
      {status ? <p className="text-sm font-medium text-mutedInk">{status}</p> : null}
    </form>
  );
}

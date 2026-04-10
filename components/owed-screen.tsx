import { ActionForm } from "@/components/action-form";
import { ApiActionButton } from "@/components/api-action-button";
import { Card } from "@/components/card";
import { SectionTitle } from "@/components/section-title";
import { formatCurrency } from "@/lib/utils";
import { store } from "@/lib/server/store";

export async function OwedScreen() {
  const loans = await store.getLoans();

  return (
    <div className="space-y-5 pb-28">
      <section className="mb-1 flex items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-bold uppercase tracking-[0.2em] text-emerald">Financial Tracking</p>
          <h1 className="font-display text-5xl font-extrabold tracking-tighter text-ink">Owed to Me</h1>
        </div>
      </section>
      <Card>
        <div className="flex items-center justify-between">
          <SectionTitle title="+ Log a Loan" />
        </div>
        <div className="mt-4">
          <ActionForm kind="loan" />
        </div>
      </Card>
      <Card>
        <SectionTitle eyebrow="Live loans" title="Active Loans" action={<span className="rounded-full bg-peach px-4 py-1 text-sm font-bold text-[#614100]">{loans.active.length} Ongoing</span>} />
        <div className="mt-4 space-y-4">
          {loans.active.map((loan) => (
            <div key={loan.id} className="rounded-[24px] bg-surfaceLowest p-6 shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xl font-bold">{loan.borrowerName}</p>
                  <p className="text-xs font-medium text-mutedInk">Borrowed on {new Date(loan.borrowedAt).toLocaleDateString()}</p>
                </div>
                <span className="rounded-full bg-peach px-3 py-1 text-xs font-semibold text-[#614100]">Ongoing</span>
              </div>
              <p className="mt-4 text-sm text-mutedInk">Purpose: {loan.purpose}</p>
              <p className="mt-6 text-xs font-bold uppercase tracking-[0.24em] text-mutedInk/60">Total owed incl. interest</p>
              <p className="mt-2 font-display text-4xl font-extrabold tracking-tight text-emerald">{formatCurrency(loan.totalOwed)}</p>
              <div className="mt-5">
                <ApiActionButton
                  endpoint={`/api/loans/${loan.id}/repay`}
                  label="Mark as repaid"
                  successLabel="Loan repaid"
                  className="w-full rounded-full bg-mint px-4 py-3 text-sm font-semibold text-emerald"
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
      <Card>
        <SectionTitle eyebrow="History" title="Settled Loans" />
        <div className="mt-4 space-y-3">
          {loans.settled.map((loan) => (
            <div key={loan.id} className="flex items-center justify-between rounded-[20px] bg-surfaceLow px-4 py-4">
              <div>
                <p className="font-semibold">{loan.borrowerName}</p>
                <p className="text-sm text-mutedInk">{loan.purpose}</p>
              </div>
              <p className="font-semibold text-emerald">{formatCurrency(loan.principal)}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

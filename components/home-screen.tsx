import Link from "next/link";
import { BrushCleaning, CheckCircle2, HandCoins, PiggyBank, Sparkles, TrendingUp, Wallet } from "lucide-react";

import { ApiActionButton } from "@/components/api-action-button";
import { Card } from "@/components/card";
import { SectionTitle } from "@/components/section-title";
import { formatCurrency } from "@/lib/utils";
import { store } from "@/lib/server/store";

const bucketMeta = {
  spend: { label: "Available", eyebrow: "Daily", icon: Wallet, color: "bg-peach text-[#614100]" },
  save: { label: "Savings", eyebrow: "Goal: Bike", icon: PiggyBank, color: "bg-mint text-[#1f6223]" },
  invest: { label: "Invested", eyebrow: "Stocks", icon: TrendingUp, color: "bg-sky text-[#002d6f]" },
  give: { label: "Tzedakah", eyebrow: "Charity", icon: HandCoins, color: "bg-coral text-[#520c00]" }
};

export async function HomeScreen() {
  const [dashboard, chores] = await Promise.all([store.getDashboard(), store.getChores()]);

  return (
    <div className="space-y-5 pb-28">
      <section className="mb-2">
        <p className="text-sm font-semibold tracking-tight text-mutedInk">
          Mom owes you <span className="font-bold text-emerald">{formatCurrency(dashboard.owedSummary.totalOwed)}</span>
        </p>
        <div className="mt-6">
          <p className="font-display text-6xl font-extrabold tracking-tighter text-emerald">{formatCurrency(dashboard.totalBalance)}</p>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.28em] text-mutedInk/60">Total Balance</p>
          <p className="mt-1 text-sm font-medium italic text-mutedInk/80">How much money I have right now</p>
        </div>
      </section>

      <section className="grid grid-cols-2 gap-4">
          {dashboard.bucketBalances.map((bucket) => {
            const meta = bucketMeta[bucket.bucket];
            const Icon = meta.icon;
            return (
              <div key={bucket.bucket} className={`flex h-40 flex-col justify-between rounded-[20px] p-5 shadow-soft ${meta.color}`}>
                <div className="flex items-start justify-between">
                  <Icon className="h-5 w-5" />
                  <span className="text-[10px] font-black uppercase tracking-[0.24em] opacity-60">{meta.eyebrow}</span>
                </div>
                <div>
                  <p className="font-display text-[1.75rem] font-extrabold tracking-tight">{formatCurrency(bucket.balance)}</p>
                  <p className="text-sm font-bold opacity-80">{meta.label}</p>
                </div>
              </div>
            );
          })}
      </section>

      <Card className="relative overflow-hidden bg-surfaceHigh">
        <div className="absolute right-0 top-0 h-full w-24 translate-x-8 skew-x-[-12deg] bg-emerald/5" />
        <div className="relative flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-surfaceLowest shadow-soft">
            <HandCoins className="h-5 w-5 text-emerald" />
          </div>
          <div>
            <p className="mb-1 text-[10px] font-black uppercase tracking-[0.2em] text-ink">Owed to Me</p>
            <p className="text-sm font-semibold text-mutedInk">
              {dashboard.owedSummary.activeCount} active loan{dashboard.owedSummary.activeCount === 1 ? "" : "s"} ·{" "}
              <span className="font-bold text-emerald">{formatCurrency(dashboard.owedSummary.totalOwed)}</span>
            </p>
          </div>
        </div>
      </Card>

      <section className="grid gap-3">
        <Link href="/income" className="flex h-16 w-full items-center justify-between rounded-full bg-ink px-6 text-lg font-bold text-white shadow-card transition active:scale-[0.98]">
          <span className="flex items-center gap-2">💰 I got money</span>
          <span className="text-xl">+</span>
        </Link>
        <div className="grid grid-cols-2 gap-3">
          <Link href="/expense" className="flex h-16 items-center justify-center rounded-full bg-surfaceHigh px-6 text-center text-sm font-bold text-ink transition active:scale-[0.98]">
            💸 I spent money
          </Link>
          <Link href="/chores" className="flex h-16 items-center justify-center rounded-full bg-surfaceHigh px-6 text-center text-sm font-bold text-ink transition active:scale-[0.98]">
            📋 My chores
          </Link>
        </div>
        <Card>
          <SectionTitle eyebrow="Daily work" title="My chores" action={<Link href="/chores" className="text-sm font-semibold text-emerald">Open</Link>} />
          <div className="mt-4 space-y-3">
            {chores.map((chore) => (
              <div key={chore.id} className="rounded-[20px] bg-surfaceLow px-4 py-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald/10 text-emerald">
                      <BrushCleaning className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-semibold">{chore.title}</p>
                      <p className="text-sm font-bold text-emerald">{formatCurrency(chore.reward)}</p>
                    </div>
                  </div>
                  {chore.latestCompletion?.approvedAt ? (
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald text-white shadow-lg shadow-emerald/20">
                      <CheckCircle2 className="h-5 w-5" />
                    </div>
                  ) : (
                    <ApiActionButton
                      endpoint={`/api/chores/${chore.id}/complete`}
                      label="Done"
                      successLabel="Chore marked done"
                      className="rounded-full bg-mint px-4 py-2 text-sm font-semibold text-emerald"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      <Card className="relative overflow-hidden bg-[#0055c4] text-white">
        <div className="absolute -bottom-5 -right-3 text-[5rem] opacity-10">✦</div>
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/75">{dashboard.currentTip.title}</p>
            <p className="mt-3 max-w-xs text-xl font-semibold leading-8">{dashboard.currentTip.body}</p>
          </div>
          <Sparkles className="h-5 w-5 text-white/80" />
        </div>
      </Card>

      <Card>
        <SectionTitle eyebrow="Recent activity" title="Money moves" action={<Link href="/history" className="text-sm font-semibold text-emerald">View all</Link>} />
        <div className="mt-4 space-y-3">
          {dashboard.recentTransactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between rounded-[20px] border border-surfaceHigh bg-surfaceLowest px-4 py-3 shadow-soft">
              <div>
                <p className="font-semibold">{transaction.description}</p>
                <p className="text-sm text-mutedInk">{new Date(transaction.occurredAt).toLocaleDateString()}</p>
              </div>
              <p className={transaction.amount >= 0 ? "font-semibold text-emerald" : "font-semibold text-coral"}>
                {formatCurrency(transaction.amount)}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

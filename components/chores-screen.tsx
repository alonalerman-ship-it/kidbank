import { BrushCleaning, CheckCircle2, CirclePlus, Dog, Shirt, Sparkles } from "lucide-react";

import { ApiActionButton } from "@/components/api-action-button";
import { Card } from "@/components/card";
import { formatCurrency } from "@/lib/utils";
import { store } from "@/lib/server/store";

const iconMap = [BrushCleaning, Dog, Sparkles, Shirt];
const colorMap = [
  "bg-emerald/10 text-emerald",
  "bg-peach/30 text-[#7b5400]",
  "bg-sky/20 text-[#004aad]",
  "bg-coral/10 text-coral"
];

export async function ChoresScreen() {
  const [chores, weeklyTotal] = await Promise.all([store.getChores(), store.getWeeklyChoreEarnings()]);

  return (
    <div className="space-y-6 pb-28">
      <section>
        <h1 className="font-display text-5xl font-extrabold tracking-tight text-emerald">My Chores</h1>
        <p className="mt-1 font-medium text-mutedInk">Earn your allowance! 🚀</p>
      </section>

      <Card className="relative overflow-hidden bg-mint text-[#1f6223]">
        <div className="absolute -right-4 -top-4 opacity-10">
          <Sparkles className="h-24 w-24" />
        </div>
        <p className="text-sm font-bold uppercase tracking-wide">Total Earned This Week</p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-display text-5xl font-extrabold">{formatCurrency(weeklyTotal)}</span>
          <span className="text-lg font-semibold opacity-70">earned</span>
        </div>
        <div className="mt-4 h-3 w-full rounded-full bg-white/50">
          <div className="h-full w-3/5 rounded-full bg-emerald" />
        </div>
      </Card>

      <section className="space-y-4">
        {chores.map((chore, index) => {
          const Icon = iconMap[index % iconMap.length];
          const color = colorMap[index % colorMap.length];
          const completed = Boolean(chore.latestCompletion?.approvedAt);

          return (
            <div key={chore.id} className="flex items-center justify-between rounded-[20px] bg-surfaceLowest p-5 shadow-soft">
              <div className="flex items-center gap-4">
                <div className={`flex h-14 w-14 items-center justify-center rounded-full ${color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className={`text-lg font-bold ${completed ? "text-mutedInk line-through" : "text-ink"}`}>{chore.title}</h3>
                  <p className="font-extrabold text-emerald">{formatCurrency(chore.reward)}</p>
                </div>
              </div>
              {completed ? (
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald text-white shadow-lg shadow-emerald/20">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              ) : (
                <ApiActionButton
                  endpoint={`/api/chores/${chore.id}/complete`}
                  label="Mark complete"
                  successLabel="Chore marked done"
                  className="flex h-12 w-12 items-center justify-center rounded-full border-4 border-surfaceHigh text-surfaceHigh"
                >
                  <CirclePlus className="h-6 w-6" />
                </ApiActionButton>
              )}
            </div>
          );
        })}
      </section>

      <Card className="border-2 border-dashed border-outlineSoft bg-surfaceLow">
        <div className="flex items-center gap-2">
          <CirclePlus className="h-5 w-5 text-emerald" />
          <h2 className="font-display text-2xl font-bold text-ink">Add New Chore</h2>
        </div>
        <div className="mt-4 space-y-4">
          <input className="w-full rounded-[20px] border-2 border-surfaceHigh bg-surfaceLowest px-4 py-3" placeholder="e.g. Wash the car" />
          <input className="w-full rounded-[20px] border-2 border-surfaceHigh bg-surfaceLowest px-4 py-3 font-bold" placeholder="0.00" type="number" />
          <button className="w-full rounded-[20px] bg-emerald py-4 text-lg font-black text-white shadow-lg shadow-emerald/20">Create Chore 💰</button>
        </div>
      </Card>
    </div>
  );
}

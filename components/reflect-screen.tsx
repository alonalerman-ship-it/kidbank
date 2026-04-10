import { Card } from "@/components/card";
import { NoteForm } from "@/components/note-form";
import { ReflectCard } from "@/components/reflect-card";
import { SectionTitle } from "@/components/section-title";
import { store } from "@/lib/server/store";

export async function ReflectScreen() {
  const monthKey = new Date().toISOString().slice(0, 7);
  const data = await store.getReflect(monthKey);
  const pendingTransactions = data.transactions.filter(
    (transaction) => !data.reflections.some((reflection) => reflection.transactionId === transaction.id)
  );
  const worthIt = data.reflections.filter((reflection) => reflection.verdict === "worth_it").length;
  const notWorthIt = data.reflections.filter((reflection) => reflection.verdict === "not_worth_it").length;
  const progress = data.transactions.length === 0 ? 100 : Math.round((data.reflections.length / data.transactions.length) * 100);

  return (
    <div className="space-y-5 pb-28">
      <Card>
        <div className="mb-3 flex items-end justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-mutedInk">Monthly Journey</p>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-ink">Reflection Complete</h2>
          </div>
          <span className="font-display text-lg font-bold text-emerald">{progress}%</span>
        </div>
        <div className="h-4 overflow-hidden rounded-full bg-surfaceHigh">
          <div className="h-full rounded-full bg-gradient-to-r from-emerald to-mint" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-[20px] bg-surfaceLowest p-6 text-center shadow-soft">
            <p className="text-sm uppercase tracking-[0.24em] text-mutedInk">Worth it</p>
            <p className="mt-3 font-display text-4xl font-extrabold text-emerald">{worthIt}</p>
          </div>
          <div className="rounded-[20px] bg-surfaceLowest p-6 text-center shadow-soft">
            <p className="text-sm uppercase tracking-[0.24em] text-mutedInk">Not worth it</p>
            <p className="mt-3 font-display text-4xl font-extrabold text-coral">{notWorthIt}</p>
          </div>
        </div>
      </Card>

      <Card>
        <SectionTitle eyebrow="Step 1" title="Was it worth it?" />
        <p className="mt-3 text-sm text-mutedInk">Look through this month&apos;s purchases and mark each one as worth it or not worth it.</p>
      </Card>

      {pendingTransactions.length === 0 ? (
        <Card>
          <p className="text-sm font-medium text-mutedInk">All this month&apos;s purchases have been reviewed.</p>
        </Card>
      ) : (
        pendingTransactions.map((transaction) => {
          const existing = data.reflections.find((reflection) => reflection.transactionId === transaction.id);
          return <ReflectCard key={transaction.id} transaction={transaction} initialVerdict={existing?.verdict} />;
        })
      )}

      <Card>
        <SectionTitle eyebrow="Step 2" title="What would you do differently?" />
        <p className="mt-3 text-sm text-mutedInk">Save one short lesson from the month. This note is stored and also added into the history/export stream.</p>
        <NoteForm monthKey={monthKey} initialNote={data.note} />
      </Card>
    </div>
  );
}

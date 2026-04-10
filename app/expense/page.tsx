import { ExpenseScreen } from "@/components/expense-screen";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export default async function ExpensePage() {
  const dashboard = await store.getDashboard();

  return <ExpenseScreen bucketBalances={dashboard.bucketBalances} />;
}

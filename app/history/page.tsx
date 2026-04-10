import { HistoryScreen } from "@/components/history-screen";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export default async function HistoryPage() {
  return <HistoryScreen transactions={await store.getTransactions()} />;
}

import { IncomeScreen } from "@/components/income-screen";
import { store } from "@/lib/server/store";

export const dynamic = "force-dynamic";

export default async function IncomePage() {
  const dashboard = await store.getDashboard();

  return <IncomeScreen bucketBalances={dashboard.bucketBalances} percentages={dashboard.settings.percentages} />;
}

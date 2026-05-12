import { DashboardOverview } from "@/features/dashboard/dashboard-overview";
import { getDashboardSummary } from "@/features/dashboard/service";

export default async function DashboardPage() {
  const summary = await getDashboardSummary();
  return <DashboardOverview summary={summary} />;
}

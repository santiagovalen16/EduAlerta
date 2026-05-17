import { LegacyAlertsPageView } from "@/modules/legacy/LegacyAlertsPageView";

export default function AlertsPage({ searchParams }: { searchParams: Promise<{ search?: string; status?: string; type?: string; page?: string }> }) {
  return <LegacyAlertsPageView searchParams={searchParams} />;
}

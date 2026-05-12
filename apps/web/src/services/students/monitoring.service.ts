import { apiClient } from "@/services/api/client";
import type { MonitoringOverview } from "@/types/dashboard";

export function fetchMonitoringOverview(filters: Record<string, string>) {
  const params = new URLSearchParams(filters);
  params.set("pageSize", filters.pageSize ?? "20");
  return apiClient<MonitoringOverview>(`/monitoring?${params.toString()}`);
}

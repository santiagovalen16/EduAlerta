"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/api/query-keys";
import { fetchMonitoringOverview } from "@/services/students/monitoring.service";

export function useMonitoringOverview(filters: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.monitoring.overview(filters),
    queryFn: () => fetchMonitoringOverview(filters)
  });
}

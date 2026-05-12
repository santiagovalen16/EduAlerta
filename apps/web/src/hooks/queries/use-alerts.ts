"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/api/query-keys";
import { fetchAlerts } from "@/services/alerts/alerts.service";

export function useAlerts(filters: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.alerts.list(filters),
    queryFn: () => fetchAlerts(filters)
  });
}

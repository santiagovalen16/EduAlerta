"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/api/query-keys";
import { fetchTerritorialOverview } from "@/services/dashboard/territorial.service";

export function useTerritorialOverview() {
  return useQuery({
    queryKey: queryKeys.territorial.overview,
    queryFn: fetchTerritorialOverview
  });
}

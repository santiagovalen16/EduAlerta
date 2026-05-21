"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/api/query-keys";
import { fetchCases } from "@/services/cases/cases.service";

export function useCases(filters: Record<string, string>) {
  return useQuery({
    queryKey: queryKeys.cases.list(filters),
    queryFn: () => fetchCases(filters)
  });
}

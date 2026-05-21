"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchCaseById } from "@/services/cases/case-comments.service";

export function useCaseDetail(id: string | null) {
  return useQuery({
    queryKey: ["cases", "detail", id],
    queryFn: () => fetchCaseById(id as string),
    enabled: Boolean(id)
  });
}

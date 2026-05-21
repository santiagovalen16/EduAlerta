"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchAlertById } from "@/services/alerts/alerts.service";

export function useAlertDetail(id: string | null) {
  return useQuery({
    queryKey: ["alerts", "detail", id],
    queryFn: () => fetchAlertById(id as string),
    enabled: Boolean(id)
  });
}

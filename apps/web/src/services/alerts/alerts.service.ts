import { apiClient } from "@/services/api/client";
import type { AlertListItem, PaginatedResponse } from "@/types/dashboard";

export function fetchAlerts(filters: Record<string, string>) {
  const params = new URLSearchParams(filters);
  params.set("pageSize", filters.pageSize ?? "20");
  return apiClient<PaginatedResponse<AlertListItem>>(`/alerts?${params.toString()}`);
}

export function updateAlert(id: string, payload: Partial<AlertListItem>) {
  return apiClient<AlertListItem>(`/alerts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

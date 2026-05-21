import { apiClient } from "@/services/api/client";
import type { AlertDetail, AlertListItem, EntityComment, PaginatedResponse } from "@/types/dashboard";

export function fetchAlerts(filters: Record<string, string>) {
  const params = new URLSearchParams(filters);
  params.set("pageSize", filters.pageSize ?? "20");
  return apiClient<PaginatedResponse<AlertListItem>>(`/alerts?${params.toString()}`);
}

export function fetchAlertById(id: string) {
  return apiClient<AlertDetail>(`/alerts/${id}`);
}

export function createAlert(payload: {
  studentId: string;
  type: AlertListItem["type"];
  priority?: AlertListItem["priority"];
  description: string;
  clientGeneratedId: string;
}) {
  return apiClient<AlertListItem>("/alerts", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateAlert(
  id: string,
  payload: Partial<Pick<AlertListItem, "type" | "status" | "priority" | "description">>
) {
  return apiClient<AlertListItem>(`/alerts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteAlert(id: string) {
  return apiClient<AlertListItem>(`/alerts/${id}`, {
    method: "DELETE"
  });
}

export function createAlertComment(id: string, body: string) {
  return apiClient<EntityComment>(`/alerts/${id}/comments`, {
    method: "POST",
    body: JSON.stringify({ body })
  });
}

export function acknowledgeAlert(id: string) {
  return apiClient<{ ok: true; alreadyAcknowledged: boolean }>(`/alerts/${id}/acknowledge`, {
    method: "POST"
  });
}

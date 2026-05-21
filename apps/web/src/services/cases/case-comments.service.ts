import { apiClient } from "@/services/api/client";
import type { CaseDetail, EntityComment } from "@/types/dashboard";

export function fetchCaseById(id: string) {
  return apiClient<CaseDetail>(`/cases/${id}`);
}

export function createCaseComment(id: string, body: string) {
  return apiClient<EntityComment>(`/cases/${id}/comments`, {
    method: "POST",
    body: JSON.stringify({ body })
  });
}

export function acknowledgeCase(id: string) {
  return apiClient<{ ok: true; alreadyAcknowledged: boolean }>(`/cases/${id}/acknowledge`, {
    method: "POST"
  });
}

import { apiClient } from "@/services/api/client";
import type { AlertPriority, CasesResponse, CaseListItem, CaseStatus, RiskLevel } from "@/types/dashboard";

export function fetchCases(filters: Record<string, string>) {
  const params = new URLSearchParams(filters);
  params.set("pageSize", filters.pageSize ?? "20");
  return apiClient<CasesResponse>(`/cases?${params.toString()}`);
}

export function createCase(payload: {
  studentId: string;
  riskLevel: RiskLevel;
  priority?: AlertPriority;
  title: string;
  summary: string;
  followUpAt?: string;
}) {
  return apiClient<CaseListItem>("/cases", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateCase(
  id: string,
  payload: Partial<{
    assignedToId: string | null;
    status: CaseStatus;
    priority: AlertPriority;
    riskLevel: RiskLevel;
    title: string;
    summary: string;
    actionsTaken: string;
    followUpAt: string | null;
  }>
) {
  return apiClient<CaseListItem>(`/cases/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload)
  });
}

export function deleteCase(id: string) {
  return apiClient<CaseListItem>(`/cases/${id}`, {
    method: "DELETE"
  });
}

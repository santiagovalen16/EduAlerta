import { serverApiFetch } from "@/lib/api/server-client";
import type { PaginatedResponse } from "@/lib/api/client";
import type { AlertListItem } from "./types";

export function getAlerts(searchParams?: { search?: string; status?: string; type?: string; page?: string }) {
  const params = new URLSearchParams();
  if (searchParams?.search) params.set("search", searchParams.search);
  if (searchParams?.status) params.set("status", searchParams.status);
  if (searchParams?.type) params.set("type", searchParams.type);
  if (searchParams?.page) params.set("page", searchParams.page);
  params.set("pageSize", "10");

  return serverApiFetch<PaginatedResponse<AlertListItem>>(`/api/alerts?${params.toString()}`);
}

import { serverApiFetch } from "@/lib/api/server-client";
import type { PaginatedResponse } from "@/lib/api/client";
import type { StudentListItem } from "./types";

export function getStudents(searchParams?: { search?: string; riskLevel?: string; page?: string }) {
  const params = new URLSearchParams();
  if (searchParams?.search) params.set("search", searchParams.search);
  if (searchParams?.riskLevel) params.set("riskLevel", searchParams.riskLevel);
  if (searchParams?.page) params.set("page", searchParams.page);
  params.set("pageSize", "10");

  return serverApiFetch<PaginatedResponse<StudentListItem>>(`/api/students?${params.toString()}`);
}

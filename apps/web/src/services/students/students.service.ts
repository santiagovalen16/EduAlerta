import { apiClient } from "@/services/api/client";
import type { PaginatedResponse, StudentOption } from "@/types/dashboard";

export function fetchStudentOptions() {
  return apiClient<PaginatedResponse<StudentOption>>("/students?page=1&pageSize=100");
}

import { apiClient } from "@/services/api/client";
import type { TerritorialOverview } from "@/types/dashboard";

export function fetchTerritorialOverview() {
  return apiClient<TerritorialOverview>("/territorial/overview");
}

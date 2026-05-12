import { serverApiFetch } from "@/lib/api/server-client";
import type { DashboardSummary } from "./types";

export function getDashboardSummary() {
  return serverApiFetch<DashboardSummary>("/api/dashboard/institution");
}

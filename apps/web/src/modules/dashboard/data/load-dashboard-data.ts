import { serverApiFetch } from "@/lib/api/server-client";
import type { AuthUser } from "@/lib/auth/types";
import type { MonitoringOverview, TerritorialOverview } from "@/types/dashboard";
import type { DashboardData, InstitutionDashboard, PublicStats } from "../types";

export async function loadDashboardData(): Promise<DashboardData> {
  const user = await serverApiFetch<AuthUser>("/api/auth/me");
  const [institution, territorial, monitoring, publicStats] = await Promise.all([
    user.permissions.includes("dashboard:institution:read") ? safeFetch<InstitutionDashboard>("/api/dashboard/institution") : Promise.resolve(null),
    user.permissions.includes("dashboard:territory:read") ? safeFetch<TerritorialOverview>("/api/territorial/overview") : Promise.resolve(null),
    user.permissions.includes("student:read") ? safeFetch<MonitoringOverview>("/api/monitoring?page=1&pageSize=5") : Promise.resolve(null),
    safeFetch<PublicStats>("/api/public/stats")
  ]);

  return { user, institution, territorial, monitoring, publicStats };
}

async function safeFetch<T>(path: string) {
  try {
    return await serverApiFetch<T>(path);
  } catch {
    return null;
  }
}

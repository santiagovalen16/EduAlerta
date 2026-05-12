import { DashboardShellClient } from "@/components/layout/dashboard-shell-client";
import type { AuthUser } from "@/lib/auth/types";
import { serverApiFetch } from "@/lib/api/server-client";

export async function AppShell({ children }: { children: React.ReactNode }) {
  const user = await serverApiFetch<AuthUser>("/api/auth/me");
  return <DashboardShellClient user={user}>{children}</DashboardShellClient>;
}

import { DashboardHeader } from "./components/DashboardHeader";
import { DashboardShell } from "./components/DashboardShell";
import { loadDashboardData } from "./data/load-dashboard-data";
import { dashboardStrategies } from "./strategies/dashboard-strategies";
import { roleCopy } from "./strategies/role-copy";
import type { RoleWorkspaceKind } from "./types";

export async function RoleWorkspace({ kind }: { kind: RoleWorkspaceKind }) {
  const data = await loadDashboardData();
  const copy = roleCopy[kind];
  const { View } = dashboardStrategies[kind];

  return (
    <DashboardShell>
      <DashboardHeader copy={copy} user={data.user} />
      <View {...data} />
    </DashboardShell>
  );
}

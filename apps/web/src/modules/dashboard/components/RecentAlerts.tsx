import { List, Panel } from "./Panel";
import type { InstitutionDashboard } from "../types";

export function RecentAlerts({ alerts }: { alerts: InstitutionDashboard["recentAlerts"] }) {
  return (
    <Panel title="Alertas recientes" description="Eventos registrados por docentes y equipos institucionales.">
      <List items={alerts.slice(0, 5).map((alert) => `${alert.student.firstName} ${alert.student.lastName} · ${alert.priority} · ${alert.description}`)} empty="Sin alertas recientes." />
    </Panel>
  );
}

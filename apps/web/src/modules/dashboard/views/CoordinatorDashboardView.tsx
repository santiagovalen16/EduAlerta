import { AlertTriangle, BarChart3, ClipboardList, Siren } from "lucide-react";
import { List, Panel } from "../components/Panel";
import { MetricGrid } from "../components/MetricGrid";
import type { DashboardData } from "../types";

export function CoordinatorDashboardView({ institution, monitoring }: DashboardData) {
  return (
    <>
      <MetricGrid
        metrics={[
          ["Casos criticos", monitoring?.metrics.critical ?? institution?.metrics.criticalStudents ?? 0, AlertTriangle],
          ["Riesgo alto", monitoring?.metrics.high ?? 0, Siren],
          ["Riesgo medio", monitoring?.metrics.medium ?? 0, ClipboardList],
          ["Alertas activas", monitoring?.metrics.activeAlerts ?? institution?.metrics.activeAlerts ?? 0, BarChart3]
        ]}
      />
      <Panel title="Bandeja de seguimiento" description="Casos recientes para priorizar, escalar o cerrar.">
        <List items={(monitoring?.data ?? []).map((student) => `${student.student} · asistencia ${student.attendanceRate}% · promedio ${student.academicAverage}`)} empty="No hay casos en seguimiento." />
      </Panel>
    </>
  );
}

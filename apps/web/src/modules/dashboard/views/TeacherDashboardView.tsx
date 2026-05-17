import { AlertTriangle, CheckCircle2, Siren, Users } from "lucide-react";
import { Checklist, Panel } from "../components/Panel";
import { MetricGrid } from "../components/MetricGrid";
import { RecentAlerts } from "../components/RecentAlerts";
import type { DashboardData } from "../types";

export function TeacherDashboardView({ institution, monitoring }: DashboardData) {
  return (
    <>
      <MetricGrid
        metrics={[
          ["Estudiantes", institution?.metrics.students ?? monitoring?.meta.total ?? 0, Users],
          ["Alertas abiertas", institution?.metrics.activeAlerts ?? monitoring?.metrics.activeAlerts ?? 0, Siren],
          ["Asistencia", `${institution?.metrics.attendanceRate ?? 0}%`, CheckCircle2],
          ["Riesgo alto", monitoring?.metrics.high ?? 0, AlertTriangle]
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Trabajo de aula" description="Acciones frecuentes para docentes.">
          <Checklist items={["Crear alerta academica", "Revisar estudiantes en riesgo", "Actualizar asistencia", "Consultar observaciones recientes"]} />
        </Panel>
        <RecentAlerts alerts={institution?.recentAlerts ?? []} />
      </div>
    </>
  );
}

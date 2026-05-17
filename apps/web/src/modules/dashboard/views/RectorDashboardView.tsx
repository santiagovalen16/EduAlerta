import { AlertTriangle, CheckCircle2, Siren, Users } from "lucide-react";
import { List, Panel } from "../components/Panel";
import { MetricGrid } from "../components/MetricGrid";
import { RecentAlerts } from "../components/RecentAlerts";
import type { DashboardData, InstitutionDashboard } from "../types";

function InstitutionMetrics({ institution }: { institution: InstitutionDashboard | null }) {
  return (
    <MetricGrid
      metrics={[
        ["Estudiantes", institution?.metrics.students ?? 0, Users],
        ["En riesgo", institution?.metrics.atRiskStudents ?? 0, AlertTriangle],
        ["Criticos", institution?.metrics.criticalStudents ?? 0, Siren],
        ["Asistencia", `${institution?.metrics.attendanceRate ?? 0}%`, CheckCircle2]
      ]}
    />
  );
}

export function RectorDashboardView({ institution, monitoring }: DashboardData) {
  return (
    <>
      <InstitutionMetrics institution={institution} />
      <div className="grid gap-4 lg:grid-cols-2">
        <RecentAlerts alerts={institution?.recentAlerts ?? []} />
        <Panel title="Estudiantes prioritarios" description="Casos que requieren seguimiento directivo.">
          <List items={(monitoring?.data ?? []).slice(0, 5).map((student) => `${student.student} · ${student.riskLevel} · ${student.activeAlerts} alertas`)} empty="Sin estudiantes priorizados." />
        </Panel>
      </div>
    </>
  );
}

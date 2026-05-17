import { Building2, Map, ShieldCheck, Siren } from "lucide-react";
import { List, Panel, Checklist } from "../components/Panel";
import { MetricGrid } from "../components/MetricGrid";
import type { DashboardData } from "../types";

export function AdminDashboardView({ institution, publicStats, territorial }: DashboardData) {
  return (
    <>
      <MetricGrid
        metrics={[
          ["Usuarios activos", institution?.metrics.students ?? publicStats?.students ?? 0, ShieldCheck],
          ["Instituciones", publicStats?.institutions ?? 0, Building2],
          ["Municipios", publicStats?.municipalities ?? 0, Map],
          ["Alertas abiertas", publicStats?.activeAlerts ?? institution?.metrics.activeAlerts ?? 0, Siren]
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Gobierno de plataforma" description="Tareas criticas para operar EduAlerta como SaaS institucional.">
          <Checklist items={["Revisar permisos y roles activos", "Auditar sesiones y actividad reciente", "Validar instituciones conectadas", "Preparar invitaciones institucionales"]} />
        </Panel>
        <Panel title="Cobertura territorial" description="Resumen conectado a datos de municipios e instituciones.">
          <List items={(territorial?.table ?? []).slice(0, 5).map((item) => `${item.municipality} · ${item.institution} · ${item.alerts} alertas`)} empty="Sin datos territoriales disponibles." />
        </Panel>
      </div>
    </>
  );
}

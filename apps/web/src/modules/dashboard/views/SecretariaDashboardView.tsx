import { AlertTriangle, Building2, Map, Siren } from "lucide-react";
import { List, Panel } from "../components/Panel";
import { MetricGrid } from "../components/MetricGrid";
import type { DashboardData } from "../types";

export function SecretariaDashboardView({ territorial, publicStats }: DashboardData) {
  return (
    <>
      <MetricGrid
        metrics={[
          ["Municipios monitoreados", territorial?.kpis.monitoredMunicipalities ?? publicStats?.municipalities ?? 0, Map],
          ["Instituciones conectadas", territorial?.kpis.connectedInstitutions ?? publicStats?.institutions ?? 0, Building2],
          ["Alertas activas", territorial?.kpis.activeAlerts ?? publicStats?.activeAlerts ?? 0, Siren],
          ["Riesgo critico", territorial?.kpis.criticalRisk ?? 0, AlertTriangle]
        ]}
      />
      <Panel title="Ranking territorial" description="Municipios e instituciones con mayor concentracion de alertas.">
        <List items={(territorial?.table ?? []).slice(0, 8).map((row) => `${row.municipality} · ${row.institution} · riesgo ${row.riskAverage}`)} empty="Sin datos territoriales disponibles." />
      </Panel>
    </>
  );
}

import { MetricCard } from "@/components/data-display/metric-card";
import type { TerritorialOverview } from "@/types/dashboard";

export function TerritorialKpis({ kpis }: { kpis: TerritorialOverview["kpis"] }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
      <MetricCard title="Estudiantes" value={String(kpis.totalStudents)} change="total" tone="default" />
      <MetricCard title="Alertas activas" value={String(kpis.activeAlerts)} change="abiertas" tone="warning" />
      <MetricCard title="Municipios" value={String(kpis.monitoredMunicipalities)} change="monitoreados" tone="success" />
      <MetricCard title="Instituciones" value={String(kpis.connectedInstitutions)} change="conectadas" tone="default" />
      <MetricCard title="Riesgo critico" value={String(kpis.criticalRisk)} change="prioridad" tone="danger" />
      <MetricCard title="Tendencia mensual" value={String(kpis.monthlyTrend)} change="alertas" tone="default" />
    </section>
  );
}

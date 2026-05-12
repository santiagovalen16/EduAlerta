"use client";

import { LoadingState } from "@/components/shared/data-state";
import { PageHeader } from "@/components/shared/page-header";
import { useTerritorialOverview } from "@/hooks/queries/use-territorial-overview";
import { TerritorialCharts } from "./territorial-charts";
import { TerritorialKpis } from "./territorial-kpis";
import { TerritorialMapPanel } from "./territorial-map-panel";
import { TerritorialTable } from "./territorial-table";

export function TerritorialDashboard() {
  const query = useTerritorialOverview();

  if (query.isLoading) return <LoadingState rows={6} />;
  if (query.isError) return <p className="text-sm text-destructive">No fue posible cargar el dashboard territorial.</p>;
  if (!query.data) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Dashboard territorial" description="Gestion territorial de riesgo escolar por municipio e institucion." />
      <TerritorialKpis kpis={query.data.kpis} />
      <TerritorialCharts charts={query.data.charts} />
      <TerritorialMapPanel points={query.data.map} />
      <TerritorialTable rows={query.data.table} />
    </div>
  );
}

"use client";

import { useMemo, useState } from "react";
import { MetricCard } from "@/components/data-display/metric-card";
import { EmptyState, LoadingState } from "@/components/shared/data-state";
import { PageHeader } from "@/components/shared/page-header";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useMonitoringOverview } from "@/hooks/queries/use-monitoring-overview";
import type { MonitoringOverview } from "@/types/dashboard";

function StudentPanel({ student, onClose }: { student: MonitoringOverview["data"][number]; onClose: () => void }) {
  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-xl overflow-y-auto border-l bg-background p-6 shadow-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Perfil de seguimiento</p>
          <h2 className="mt-1 text-xl font-semibold">{student.student}</h2>
        </div>
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>
      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <div className="rounded-md border p-4">
          <p className="text-xs text-muted-foreground">Acudiente</p>
          <p className="font-medium">{student.guardian ?? "No registrado"}</p>
        </div>
        <div className="rounded-md border p-4">
          <p className="text-xs text-muted-foreground">Asistencia</p>
          <p className="font-medium">{student.attendanceRate}%</p>
        </div>
      </div>
      <div className="mt-4 rounded-md border p-4">
        <p className="text-sm font-medium">Timeline</p>
        <div className="mt-3 space-y-3">
          {student.timeline.map((item) => (
            <div key={`${item.type}-${item.date}`} className="rounded-md bg-muted p-3 text-sm">
              <p>{item.label}</p>
              <p className="mt-1 text-xs text-muted-foreground">{new Date(item.date).toLocaleDateString("es-CO")}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function MonitoringView() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<MonitoringOverview["data"][number] | null>(null);
  const filters = useMemo(() => ({ search }), [search]);
  const query = useMonitoringOverview(filters);

  if (query.isLoading) return <LoadingState rows={7} />;
  if (query.isError) return <p className="text-sm text-destructive">No fue posible cargar seguimiento.</p>;
  if (!query.data) return null;

  return (
    <div className="space-y-6">
      <PageHeader title="Estudiantes en seguimiento" description="Seguimiento institucional con asistencia, alertas y promedio academico desde PostgreSQL." />
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard title="Criticos" value={String(query.data.metrics.critical)} change="prioridad" tone="danger" />
        <MetricCard title="Riesgo alto" value={String(query.data.metrics.high)} change="alto" tone="warning" />
        <MetricCard title="Riesgo medio" value={String(query.data.metrics.medium)} change="medio" tone="default" />
        <MetricCard title="Riesgo bajo" value={String(query.data.metrics.low)} change="estable" tone="success" />
        <MetricCard title="Alertas activas" value={String(query.data.metrics.activeAlerts)} change="abiertas" tone="warning" />
      </section>
      <Card>
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>Monitoreo institucional</CardTitle>
          <Input className="max-w-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar estudiante o institucion" />
        </CardHeader>
        <CardContent>
          {query.data.data.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-muted-foreground">
                  <tr>
                    <th className="py-3 font-medium">Estudiante</th>
                    <th className="py-3 font-medium">Curso</th>
                    <th className="py-3 font-medium">Institucion</th>
                    <th className="py-3 font-medium">Acudiente</th>
                    <th className="py-3 font-medium">Riesgo</th>
                    <th className="py-3 font-medium">Alertas</th>
                    <th className="py-3 font-medium">Asistencia</th>
                    <th className="py-3 font-medium">Promedio</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {query.data.data.map((student) => (
                    <tr key={student.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setSelected(student)}>
                      <td className="py-3 font-medium">{student.student}</td>
                      <td className="py-3">{student.course}</td>
                      <td className="py-3">{student.institution}</td>
                      <td className="py-3">{student.guardian ?? "No registrado"}</td>
                      <td className="py-3"><RiskBadge value={student.riskLevel} /></td>
                      <td className="py-3">{student.activeAlerts}</td>
                      <td className="py-3">{student.attendanceRate}%</td>
                      <td className="py-3">{student.academicAverage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="Sin estudiantes" description="No hay estudiantes que coincidan con los filtros." />
          )}
        </CardContent>
      </Card>
      {selected ? <StudentPanel student={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}

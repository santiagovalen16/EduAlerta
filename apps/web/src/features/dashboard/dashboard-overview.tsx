import { RiskTrendChart } from "@/components/charts/risk-trend-chart";
import { MetricCard } from "@/components/data-display/metric-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardSummary, RiskLevel } from "./types";

const riskLabel: Record<RiskLevel, string> = {
  LOW: "Bajo",
  MEDIUM: "Medio",
  HIGH: "Alto",
  CRITICAL: "Critico"
};

const riskTone: Record<RiskLevel, "success" | "muted" | "warning" | "danger"> = {
  LOW: "success",
  MEDIUM: "muted",
  HIGH: "warning",
  CRITICAL: "danger"
};

export function DashboardOverview({ summary }: { summary: DashboardSummary }) {
  const { metrics } = summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-normal">Dashboard institucional</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Seguimiento ejecutivo de alertas, riesgo academico y priorizacion de acompanamiento.
          </p>
        </div>
        <Button>Registrar alerta</Button>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4" aria-label="Indicadores principales">
        <MetricCard title="Estudiantes" value={String(metrics.totalStudents)} change="matriculados" tone="default" />
        <MetricCard title="Riesgo alto" value={String(metrics.highRiskStudents)} change="alto/critico" tone="warning" />
        <MetricCard title="Alertas nuevas" value={String(metrics.todayAlerts)} change="hoy" tone="warning" />
        <MetricCard title="Asistencia promedio" value={`${metrics.attendanceAverage}%`} change="registros" tone="success" />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Distribucion de riesgo</CardTitle>
            <CardDescription>Estudiantes clasificados por nivel de riesgo desde PostgreSQL.</CardDescription>
          </CardHeader>
          <CardContent>
            {summary.riskTrend.length ? (
              <RiskTrendChart data={summary.riskTrend} />
            ) : (
              <p className="py-16 text-center text-sm text-muted-foreground">No hay datos de riesgo registrados.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estudiantes priorizados</CardTitle>
            <CardDescription>Casos con riesgo medio, alto o critico.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {summary.priorityStudents.length ? (
              summary.priorityStudents.map((student) => (
                <div key={student.id} className="rounded-md border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">Curso {student.course?.name ?? student.grade}</p>
                    </div>
                    <Badge variant={riskTone[student.riskLevel]}>{riskLabel[student.riskLevel]}</Badge>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">
                    {student.alerts[0]?.description ?? `${student._count.alerts} alertas activas registradas.`}
                  </p>
                </div>
              ))
            ) : (
              <p className="py-10 text-center text-sm text-muted-foreground">No hay estudiantes priorizados.</p>
            )}
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>Alertas recientes</CardTitle>
          <CardDescription>Ultimos registros creados por docentes.</CardDescription>
        </CardHeader>
        <CardContent className="divide-y">
          {summary.recentAlerts.length ? (
            summary.recentAlerts.map((alert) => (
              <div key={alert.id} className="flex flex-col gap-2 py-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="font-medium">
                    {alert.student.firstName} {alert.student.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">{alert.description}</p>
                </div>
                <Badge variant="default">{alert.type}</Badge>
              </div>
            ))
          ) : (
            <p className="py-10 text-center text-sm text-muted-foreground">No hay alertas registradas.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

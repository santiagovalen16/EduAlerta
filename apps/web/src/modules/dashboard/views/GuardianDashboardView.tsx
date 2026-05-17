import { BarChart3, CheckCircle2, Siren, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { List, Panel } from "../components/Panel";
import { MetricGrid } from "../components/MetricGrid";
import type { DashboardData } from "../types";

export function GuardianDashboardView({ user, monitoring }: DashboardData) {
  const children = monitoring?.data ?? [];
  const activeAlerts = children.reduce((total, child) => total + child.activeAlerts, 0);
  const attendanceAverage = children.length === 0 ? 0 : Math.round(children.reduce((total, child) => total + child.attendanceRate, 0) / children.length);
  const academicAverage = children.length === 0 ? 0 : Number((children.reduce((total, child) => total + child.academicAverage, 0) / children.length).toFixed(2));

  return (
    <>
      <MetricGrid
        metrics={[
          ["Hijos vinculados", children.length, Users],
          ["Alertas activas", activeAlerts, Siren],
          ["Asistencia", `${attendanceAverage}%`, CheckCircle2],
          ["Promedio", academicAverage, BarChart3]
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel title="Mis hijos" description={`Informacion visible para ${user.name}, filtrada por vinculacion de acudiente.`}>
          <div className="space-y-3">
            {children.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay estudiantes vinculados a esta cuenta de acudiente.</p>
            ) : (
              children.map((child) => (
                <div key={child.id} className="rounded-md border p-3">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{child.student}</p>
                      <p className="text-sm text-muted-foreground">
                        {child.course} · {child.institution}
                      </p>
                    </div>
                    <Badge variant={child.riskLevel === "CRITICAL" || child.riskLevel === "HIGH" ? "danger" : "muted"}>{child.riskLevel}</Badge>
                  </div>
                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
                    <span>Alertas: {child.activeAlerts}</span>
                    <span>Asistencia: {child.attendanceRate}%</span>
                    <span>Promedio: {child.academicAverage}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Panel>
        <Panel title="Ultimos movimientos" description="Alertas y casos recientes asociados unicamente a tus hijos.">
          <List
            items={children.flatMap((child) => child.timeline.slice(0, 3).map((item) => `${child.student} · ${item.type} · ${item.label}`)).slice(0, 6)}
            empty="No hay actividad reciente visible para esta cuenta."
          />
        </Panel>
      </div>
    </>
  );
}

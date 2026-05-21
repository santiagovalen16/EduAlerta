import { AlertTriangle, CheckCircle2, ClipboardCheck, Siren, Users } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { Button } from "@/components/ui/button";
import { Checklist, Panel } from "../components/Panel";
import { MetricGrid } from "../components/MetricGrid";
import { RecentAlerts } from "../components/RecentAlerts";
import type { DashboardData } from "../types";

export function TeacherDashboardView({ institution, monitoring }: DashboardData) {
  const assignedStudents = (monitoring?.data ?? []).map(
    (student) =>
      `${student.student} · ${student.course} · asistencia ${student.attendanceRate}% · ${student.activeAlerts} alertas`
  );

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
          <div className="space-y-4">
            <Checklist items={["Crear alerta academica", "Revisar estudiantes en riesgo", "Registrar asistencia diaria", "Consultar observaciones recientes"]} />
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={"/dashboard/attendance" as Route}>
                  <ClipboardCheck className="h-4 w-4" />
                  Registrar asistencia
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href={"/dashboard/alerts" as Route}>
                  <Siren className="h-4 w-4" />
                  Abrir alertas
                </Link>
              </Button>
            </div>
            <div className="rounded-md border bg-muted/30 p-4">
              <p className="text-sm font-medium">Registro de asistencia docente</p>
              <p className="mt-1 text-sm text-muted-foreground">
                El docente registra la asistencia diaria y esa informacion se refleja despues en consultas institucionales, reportes y vistas de acudientes.
              </p>
            </div>
          </div>
        </Panel>
        <Panel title="Estudiantes asignados" description="Listado visible para el docente con sus estudiantes actuales.">
          <div className="space-y-2">
            {assignedStudents.length === 0 ? (
              <p className="text-sm text-muted-foreground">No hay estudiantes asignados visibles en este momento.</p>
            ) : (
              assignedStudents.map((student) => (
                <div key={student} className="rounded-md border px-3 py-2 text-sm">
                  {student}
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>
      <div className="grid gap-4">
        <RecentAlerts alerts={institution?.recentAlerts ?? []} />
      </div>
    </>
  );
}

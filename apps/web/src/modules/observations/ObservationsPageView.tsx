import { ObservationForm } from "@/components/operations/observation-form";
import { OperationTable } from "@/components/operations/operation-table";
import { Badge } from "@/components/ui/badge";
import { serverApiFetch } from "@/lib/api/server-client";
import type { ObservationsResponse, StudentsResponse } from "./types";

export async function ObservationsPageView() {
  const [students, observations] = await Promise.all([
    serverApiFetch<StudentsResponse>("/api/students?page=1&pageSize=100"),
    serverApiFetch<ObservationsResponse>("/api/observations?page=1&pageSize=30")
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Observador del estudiante</h1>
        <p className="mt-1 text-sm text-muted-foreground">Registro institucional de comportamiento, convivencia, rendimiento y compromisos.</p>
      </div>
      <ObservationForm students={students.data.map((item) => ({ id: item.id, name: `${item.firstName} ${item.lastName}` }))} />
      <OperationTable
        title="Observaciones recientes"
        columns={["Observacion", "Estudiante", "Categoria", "Severidad", "Autor"]}
        rows={observations.data.map((item) => [
          <div key="obs"><p className="font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{item.description}</p></div>,
          `${item.student.firstName} ${item.student.lastName}`,
          item.category,
          <Badge key="severity" variant={item.severity === "CRITICAL" ? "danger" : item.severity === "HIGH" ? "warning" : "muted"}>{item.severity}</Badge>,
          item.author?.name ?? "Sistema"
        ])}
      />
    </div>
  );
}

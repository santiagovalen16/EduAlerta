import { OperationTable } from "@/components/operations/operation-table";
import { Badge } from "@/components/ui/badge";
import { serverApiFetch } from "@/lib/api/server-client";
import type { IncidentsResponse } from "./types";

export async function IncidentsPageView() {
  const incidents = await serverApiFetch<IncidentsResponse>("/api/incidents?page=1&pageSize=30");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Convivencia e incidentes</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gestion disciplinaria con responsables, testigos, evidencias y resolucion.</p>
      </div>
      <OperationTable
        title="Incidentes recientes"
        columns={["Incidente", "Estudiante", "Tipo", "Estado", "Severidad", "Reportado por"]}
        rows={incidents.data.map((item) => [
          <div key="incident"><p className="font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{new Date(item.occurredAt).toLocaleDateString("es-CO")}</p></div>,
          `${item.student.firstName} ${item.student.lastName}`,
          item.type,
          <Badge key="status" variant="muted">{item.status}</Badge>,
          <Badge key="severity" variant={item.severity === "CRITICAL" ? "danger" : item.severity === "HIGH" ? "warning" : "default"}>{item.severity}</Badge>,
          item.reportedBy?.name ?? "Sistema"
        ])}
      />
    </div>
  );
}

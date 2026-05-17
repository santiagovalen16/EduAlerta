import { Badge } from "@/components/ui/badge";
import { OperationTable } from "@/components/operations/operation-table";
import { serverApiFetch } from "@/lib/api/server-client";
import type { CasesResponse } from "./types";

export async function CasesPageView() {
  const cases = await serverApiFetch<CasesResponse>("/api/cases?page=1&pageSize=20");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Casos institucionales</h1>
        <p className="mt-1 text-sm text-muted-foreground">Gestion tipo Jira/Linear para seguimiento, responsables, prioridad y timeline.</p>
      </div>
      <OperationTable
        title="Bandeja de casos"
        columns={["Caso", "Estudiante", "Estado", "Prioridad", "Responsable", "Actividad"]}
        rows={cases.data.map((item) => [
          <div key="case"><p className="font-medium">{item.title}</p><p className="text-xs text-muted-foreground">{new Date(item.openedAt).toLocaleDateString("es-CO")}</p></div>,
          `${item.student.firstName} ${item.student.lastName} · ${item.student.grade}`,
          <Badge key="status" variant="muted">{item.status}</Badge>,
          <Badge key="priority" variant={item.priority === "CRITICAL" ? "danger" : item.priority === "HIGH" ? "warning" : "default"}>{item.priority}</Badge>,
          item.assignedTo?.name ?? "Sin responsable",
          `${item._count.comments} comentarios · ${item._count.events} eventos`
        ])}
      />
    </div>
  );
}

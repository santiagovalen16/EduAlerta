import { OperationTable } from "@/components/operations/operation-table";
import { Badge } from "@/components/ui/badge";
import { serverApiFetch } from "@/lib/api/server-client";
import type { ActivityResponse } from "./types";

export async function ActivityPageView() {
  const activity = await serverApiFetch<ActivityResponse>("/api/activity");
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Actividad reciente</h1>
        <p className="mt-1 text-sm text-muted-foreground">Feed institucional con alertas, casos, incidentes y observaciones.</p>
      </div>
      <OperationTable
        title="Feed operativo"
        columns={["Tipo", "Actividad", "Estudiante", "Actor", "Fecha"]}
        rows={activity.data.map((item) => [
          <Badge key="type" variant="muted">{item.type}</Badge>,
          item.title,
          item.student,
          item.actor,
          new Date(item.createdAt).toLocaleString("es-CO")
        ])}
      />
    </div>
  );
}

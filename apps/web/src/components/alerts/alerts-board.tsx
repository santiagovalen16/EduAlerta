"use client";

import { useMemo, useState } from "react";
import { AlertStatusBadge, RiskBadge } from "@/components/shared/risk-badge";
import { LoadingState, EmptyState } from "@/components/shared/data-state";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAlerts } from "@/hooks/queries/use-alerts";
import { useUpdateAlert } from "@/hooks/mutations/use-update-alert";
import type { AlertListItem } from "@/types/dashboard";

function AlertDetail({ alert, onClose }: { alert: AlertListItem; onClose: () => void }) {
  const mutation = useUpdateAlert();

  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-xl overflow-y-auto border-l bg-background p-6 shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Alerta academica</p>
          <h2 className="mt-1 text-xl font-semibold">
            {alert.student.firstName} {alert.student.lastName}
          </h2>
        </div>
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>
      <div className="mt-6 space-y-4">
        <div className="rounded-md border p-4">
          <p className="text-sm font-medium">Descripcion</p>
          <p className="mt-2 text-sm text-muted-foreground">{alert.description}</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border p-4">
            <p className="text-xs text-muted-foreground">Estado</p>
            <AlertStatusBadge value={alert.status} />
          </div>
          <div className="rounded-md border p-4">
            <p className="text-xs text-muted-foreground">Prioridad</p>
            <RiskBadge value={alert.priority} />
          </div>
        </div>
        <div className="rounded-md border p-4">
          <p className="text-sm font-medium">Timeline</p>
          <div className="mt-3 space-y-3 text-sm text-muted-foreground">
            <p>Creada por {alert.createdBy.name}</p>
            <p>Registrada el {new Date(alert.createdAt).toLocaleDateString("es-CO")}</p>
            <p>Estado actual: {alert.status}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            disabled={mutation.isPending}
            onClick={() => mutation.mutate({ id: alert.id, payload: { status: "IN_REVIEW" } })}
          >
            Pasar a revision
          </Button>
          <Button
            variant="outline"
            disabled={mutation.isPending}
            onClick={() => mutation.mutate({ id: alert.id, payload: { status: "CLOSED" } })}
          >
            Cerrar alerta
          </Button>
        </div>
      </div>
    </aside>
  );
}

export function AlertsBoard() {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AlertListItem | null>(null);
  const filters = useMemo(() => ({ search }), [search]);
  const query = useAlerts(filters);

  return (
    <div className="space-y-6">
      <PageHeader title="Alertas academicas" description="Gestion moderna de alertas con filtros, seguimiento y cambios de estado." />
      <Card>
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>Base de alertas</CardTitle>
          <Input className="max-w-sm" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar estudiante o descripcion" />
        </CardHeader>
        <CardContent>
          {query.isLoading ? (
            <LoadingState />
          ) : query.isError ? (
            <p className="text-sm text-destructive">No fue posible cargar alertas.</p>
          ) : query.data?.data.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-muted-foreground">
                  <tr>
                    <th className="py-3 font-medium">Estudiante</th>
                    <th className="py-3 font-medium">Tipo</th>
                    <th className="py-3 font-medium">Estado</th>
                    <th className="py-3 font-medium">Prioridad</th>
                    <th className="py-3 font-medium">Docente</th>
                    <th className="py-3 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {query.data.data.map((alert) => (
                    <tr key={alert.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setSelected(alert)}>
                      <td className="py-3 font-medium">
                        {alert.student.firstName} {alert.student.lastName}
                      </td>
                      <td className="py-3">{alert.type}</td>
                      <td className="py-3">
                        <AlertStatusBadge value={alert.status} />
                      </td>
                      <td className="py-3">
                        <RiskBadge value={alert.priority} />
                      </td>
                      <td className="py-3">{alert.createdBy.name}</td>
                      <td className="py-3">{new Date(alert.createdAt).toLocaleDateString("es-CO")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="Sin alertas" description="No hay alertas que coincidan con los filtros." />
          )}
        </CardContent>
      </Card>
      {selected ? <AlertDetail alert={selected} onClose={() => setSelected(null)} /> : null}
    </div>
  );
}

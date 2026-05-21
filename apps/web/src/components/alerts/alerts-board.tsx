"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { EmptyState, LoadingState } from "@/components/shared/data-state";
import { PageHeader } from "@/components/shared/page-header";
import { AlertStatusBadge, RiskBadge } from "@/components/shared/risk-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateAlert } from "@/hooks/mutations/use-create-alert";
import { useAcknowledgeAlert } from "@/hooks/mutations/use-acknowledge-alert";
import { useCreateAlertComment } from "@/hooks/mutations/use-create-alert-comment";
import { useDeleteAlert } from "@/hooks/mutations/use-delete-alert";
import { useUpdateAlert } from "@/hooks/mutations/use-update-alert";
import { useAlertDetail } from "@/hooks/queries/use-alert-detail";
import { useAlerts } from "@/hooks/queries/use-alerts";
import { useCurrentUser } from "@/hooks/queries/use-current-user";
import { useStudentOptions } from "@/hooks/queries/use-student-options";
import type { AlertDetail, AlertListItem } from "@/types/dashboard";

const ALERT_TYPES = ["ATTENDANCE", "ACADEMIC", "BEHAVIOR", "FAMILY"] as const;
const ALERT_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const ALERT_STATUSES = ["NEW", "IN_REVIEW", "ESCALATED", "CLOSED"] as const;

function AlertCreateForm() {
  const studentsQuery = useStudentOptions();
  const currentUserQuery = useCurrentUser();
  const createMutation = useCreateAlert();
  const canCreate = currentUserQuery.data?.permissions.includes("alert:create") ?? false;
  const [studentId, setStudentId] = useState("");
  const [type, setType] = useState<(typeof ALERT_TYPES)[number]>("ATTENDANCE");
  const [priority, setPriority] = useState<(typeof ALERT_PRIORITIES)[number]>("MEDIUM");
  const [description, setDescription] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!studentId || description.trim().length < 12) return;

    await createMutation.mutateAsync({
      studentId,
      type,
      priority,
      description: description.trim(),
      clientGeneratedId: crypto.randomUUID()
    });

    setDescription("");
    setStudentId("");
    setType("ATTENDANCE");
    setPriority("MEDIUM");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear alerta</CardTitle>
      </CardHeader>
      <CardContent>
        {!canCreate ? (
          <p className="text-sm text-muted-foreground">Tu perfil puede revisar alertas, pero no crear nuevas.</p>
        ) : (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="alert-student">Estudiante</Label>
              <select
                id="alert-student"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={studentId}
                onChange={(event) => setStudentId(event.target.value)}
              >
                <option value="">Selecciona un estudiante</option>
                {studentsQuery.data?.data.map((student) => (
                  <option key={student.id} value={student.id}>
                    {student.firstName} {student.lastName} · {student.grade} · {student.institution.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alert-type">Tipo</Label>
              <select
                id="alert-type"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={type}
                onChange={(event) => setType(event.target.value as (typeof ALERT_TYPES)[number])}
              >
                {ALERT_TYPES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="alert-priority">Prioridad</Label>
              <select
                id="alert-priority"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={priority}
                onChange={(event) => setPriority(event.target.value as (typeof ALERT_PRIORITIES)[number])}
              >
                {ALERT_PRIORITIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="alert-description">Descripcion</Label>
              <textarea
                id="alert-description"
                className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe el motivo de la alerta y el contexto observado."
              />
            </div>
            <div className="md:col-span-2">
              <Button disabled={createMutation.isPending || studentsQuery.isLoading} type="submit">
                Registrar alerta
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function AlertDetail({
  alertId,
  onClose
}: {
  alertId: string;
  onClose: () => void;
}) {
  const currentUserQuery = useCurrentUser();
  const detailQuery = useAlertDetail(alertId);
  const acknowledgeMutation = useAcknowledgeAlert();
  const commentMutation = useCreateAlertComment();
  const updateMutation = useUpdateAlert();
  const deleteMutation = useDeleteAlert();
  const canUpdate = currentUserQuery.data?.permissions.includes("alert:update") ?? false;
  const canDelete = ["SUPER_ADMIN", "RECTOR", "COORDINADOR"].includes(currentUserQuery.data?.role ?? "");
  const isGuardian = currentUserQuery.data?.role === "ACUDIENTE";
  const [type, setType] = useState<AlertListItem["type"]>("ATTENDANCE");
  const [status, setStatus] = useState<AlertListItem["status"]>("NEW");
  const [priority, setPriority] = useState<AlertListItem["priority"]>("MEDIUM");
  const [description, setDescription] = useState("");
  const [response, setResponse] = useState("");

  useEffect(() => {
    if (!detailQuery.data) return;
    setType(detailQuery.data.type);
    setStatus(detailQuery.data.status);
    setPriority(detailQuery.data.priority);
    setDescription(detailQuery.data.description);
  }, [detailQuery.data]);

  const alert = detailQuery.data as AlertDetail | undefined;

  async function saveChanges() {
    if (!alert) return;
    await updateMutation.mutateAsync({
      id: alert.id,
      payload: {
        type,
        status,
        priority,
        description: description.trim()
      }
    });
  }

  async function removeAlert() {
    if (!alert) return;
    await deleteMutation.mutateAsync(alert.id);
    onClose();
  }

  async function sendResponse() {
    if (!alert || response.trim().length < 2) return;
    await commentMutation.mutateAsync({ id: alert.id, body: response.trim() });
    setResponse("");
  }

  async function acknowledgeReceipt() {
    if (!alert) return;
    await acknowledgeMutation.mutateAsync(alert.id);
  }

  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-xl overflow-y-auto border-l bg-background p-6 shadow-xl">
      {detailQuery.isLoading ? <LoadingState rows={6} /> : null}
      {!detailQuery.isLoading && !alert ? <p className="text-sm text-destructive">No fue posible cargar la alerta.</p> : null}
      {alert ? (
        <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Detalle de alerta</p>
          <h2 className="mt-1 text-xl font-semibold">
            {alert.student.firstName} {alert.student.lastName}
          </h2>
        </div>
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>
      <div className="mt-6 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="detail-type">Tipo</Label>
            <select
              id="detail-type"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={!canUpdate}
              value={type}
              onChange={(event) => setType(event.target.value as AlertListItem["type"])}
            >
              {ALERT_TYPES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="detail-status">Estado</Label>
            <select
              id="detail-status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={!canUpdate}
              value={status}
              onChange={(event) => setStatus(event.target.value as AlertListItem["status"])}
            >
              {ALERT_STATUSES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="detail-priority">Prioridad</Label>
            <select
              id="detail-priority"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={!canUpdate}
              value={priority}
              onChange={(event) => setPriority(event.target.value as AlertListItem["priority"])}
            >
              {ALERT_PRIORITIES.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
          <div className="rounded-md border p-4">
            <p className="text-xs text-muted-foreground">Resumen</p>
            <div className="mt-2 flex gap-2">
              <AlertStatusBadge value={status} />
              <RiskBadge value={priority} />
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="detail-description">Descripcion</Label>
          <textarea
            id="detail-description"
            className="min-h-32 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={!canUpdate}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
          />
        </div>
        <div className="rounded-md border p-4 text-sm text-muted-foreground">
          <p>Creada por {alert.createdBy.name}</p>
          <p>Institucion: {alert.student.institution.name}</p>
          <p>Registrada el {new Date(alert.createdAt).toLocaleDateString("es-CO")}</p>
        </div>
        <div className="rounded-md border p-4">
          <p className="text-sm font-medium">Respuestas y observaciones</p>
          <div className="mt-3 space-y-3">
            {alert.comments.length ? (
              alert.comments.map((comment) => (
                <div key={comment.id} className="rounded-md bg-muted p-3 text-sm">
                  <p>{comment.body}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {comment.author?.name ?? "Sistema"} · {new Date(comment.createdAt).toLocaleString("es-CO")}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">Aun no hay respuestas registradas.</p>
            )}
          </div>
          {canUpdate ? (
            <div className="mt-4 space-y-2">
              <Label htmlFor="alert-response">Respuesta del rector o directivo</Label>
              <textarea
                id="alert-response"
                className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={response}
                onChange={(event) => setResponse(event.target.value)}
                placeholder="Esta respuesta se reflejara para docentes y acudientes."
              />
              <Button disabled={commentMutation.isPending} onClick={sendResponse}>
                Enviar respuesta
              </Button>
            </div>
          ) : isGuardian ? (
            <div className="mt-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Como acudiente solo puedes revisar la alerta y confirmar su recibido.
              </p>
              <Button
                disabled={alert.acknowledgedByCurrentUser || acknowledgeMutation.isPending}
                onClick={acknowledgeReceipt}
              >
                {alert.acknowledgedByCurrentUser ? "Recibido confirmado" : "Confirmar recibido"}
              </Button>
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={!canUpdate || updateMutation.isPending} onClick={saveChanges}>
            Guardar cambios
          </Button>
          {canDelete ? (
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={removeAlert}
            >
              Eliminar alerta
            </Button>
          ) : null}
        </div>
      </div>
        </>
      ) : null}
    </aside>
  );
}

export function AlertsBoard() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const filters = useMemo(() => ({ search }), [search]);
  const query = useAlerts(filters);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Alertas academicas"
        description="Docentes, coordinacion y rectoria pueden revisar y actualizar alertas; el seguimiento posterior queda a cargo de rectoria."
      />
      <AlertCreateForm />
      <Card>
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>Base de alertas</CardTitle>
          <Input
            className="max-w-sm"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar estudiante o descripcion"
          />
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
                    <th className="py-3 font-medium">Institucion</th>
                    <th className="py-3 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {query.data.data.map((alert) => (
                    <tr
                      key={alert.id}
                      className="cursor-pointer hover:bg-muted/40"
                      onClick={() => setSelectedId(alert.id)}
                    >
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
                      <td className="py-3">{alert.student.institution.name}</td>
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
      {selectedId ? <AlertDetail alertId={selectedId} onClose={() => setSelectedId(null)} /> : null}
    </div>
  );
}

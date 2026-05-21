"use client";

import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import { MetricCard } from "@/components/data-display/metric-card";
import { EmptyState, LoadingState } from "@/components/shared/data-state";
import { PageHeader } from "@/components/shared/page-header";
import { RiskBadge } from "@/components/shared/risk-badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateCase } from "@/hooks/mutations/use-create-case";
import { useAcknowledgeCase } from "@/hooks/mutations/use-acknowledge-case";
import { useCreateCaseComment } from "@/hooks/mutations/use-create-case-comment";
import { useDeleteCase } from "@/hooks/mutations/use-delete-case";
import { useUpdateCase } from "@/hooks/mutations/use-update-case";
import { useCaseDetail } from "@/hooks/queries/use-case-detail";
import { useCases } from "@/hooks/queries/use-cases";
import { useCurrentUser } from "@/hooks/queries/use-current-user";
import { useMonitoringOverview } from "@/hooks/queries/use-monitoring-overview";
import { useStudentOptions } from "@/hooks/queries/use-student-options";
import type { CaseListItem, CaseStatus, MonitoringOverview, RiskLevel } from "@/types/dashboard";

const CASE_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
const CASE_STATUSES = ["NEW", "IN_REVIEW", "ESCALATED", "INTERVENTION", "FOLLOW_UP", "RESOLVED", "CLOSED"] as const;
const RISK_LEVELS = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;

function CaseCreateForm() {
  const studentsQuery = useStudentOptions();
  const currentUserQuery = useCurrentUser();
  const createMutation = useCreateCase();
  const canCreate = currentUserQuery.data?.permissions.includes("case:create") ?? false;
  const [studentId, setStudentId] = useState("");
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [priority, setPriority] = useState<(typeof CASE_PRIORITIES)[number]>("MEDIUM");
  const [riskLevel, setRiskLevel] = useState<(typeof RISK_LEVELS)[number]>("MEDIUM");
  const [followUpAt, setFollowUpAt] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!studentId || title.trim().length < 4 || summary.trim().length < 8) return;

    await createMutation.mutateAsync({
      studentId,
      title: title.trim(),
      summary: summary.trim(),
      priority,
      riskLevel,
      followUpAt: followUpAt || undefined
    });

    setStudentId("");
    setTitle("");
    setSummary("");
    setPriority("MEDIUM");
    setRiskLevel("MEDIUM");
    setFollowUpAt("");
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Crear seguimiento</CardTitle>
      </CardHeader>
      <CardContent>
        {!canCreate ? (
          <p className="text-sm text-muted-foreground">Tu perfil puede revisar seguimientos, pero no crear nuevos casos.</p>
        ) : (
          <form className="grid gap-4 md:grid-cols-2" onSubmit={onSubmit}>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="case-student">Estudiante</Label>
              <select
                id="case-student"
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
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="case-title">Titulo</Label>
              <Input id="case-title" value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Seguimiento por riesgo academico" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="case-priority">Prioridad</Label>
              <select
                id="case-priority"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={priority}
                onChange={(event) => setPriority(event.target.value as (typeof CASE_PRIORITIES)[number])}
              >
                {CASE_PRIORITIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="case-risk">Riesgo</Label>
              <select
                id="case-risk"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={riskLevel}
                onChange={(event) => setRiskLevel(event.target.value as (typeof RISK_LEVELS)[number])}
              >
                {RISK_LEVELS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="case-summary">Resumen</Label>
              <textarea
                id="case-summary"
                className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={summary}
                onChange={(event) => setSummary(event.target.value)}
                placeholder="Describe la situacion, hallazgos y objetivo del seguimiento."
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="case-follow-up">Proximo seguimiento</Label>
              <Input id="case-follow-up" type="datetime-local" value={followUpAt} onChange={(event) => setFollowUpAt(event.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Button disabled={createMutation.isPending || studentsQuery.isLoading} type="submit">
                Crear seguimiento
              </Button>
            </div>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

function CaseDetail({ caseId, onClose }: { caseId: string; onClose: () => void }) {
  const currentUserQuery = useCurrentUser();
  const detailQuery = useCaseDetail(caseId);
  const acknowledgeMutation = useAcknowledgeCase();
  const commentMutation = useCreateCaseComment();
  const updateMutation = useUpdateCase();
  const deleteMutation = useDeleteCase();
  const canUpdate = currentUserQuery.data?.permissions.includes("case:update") ?? false;
  const isGuardian = currentUserQuery.data?.role === "ACUDIENTE";
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [actionsTaken, setActionsTaken] = useState("");
  const [priority, setPriority] = useState<CaseListItem["priority"]>("MEDIUM");
  const [riskLevel, setRiskLevel] = useState<RiskLevel>("MEDIUM");
  const [status, setStatus] = useState<CaseStatus>("NEW");
  const [followUpAt, setFollowUpAt] = useState("");
  const [response, setResponse] = useState("");
  const errorMessage = detailQuery.error instanceof Error ? detailQuery.error.message : null;

  const item = detailQuery.data;

  useEffect(() => {
    if (!item) return;
    setTitle(item.title);
    setSummary(item.summary);
    setActionsTaken(item.actionsTaken ?? "");
    setPriority(item.priority);
    setRiskLevel(item.riskLevel);
    setStatus(item.status);
    setFollowUpAt(item.followUpAt ? item.followUpAt.slice(0, 16) : "");
  }, [item]);

  async function saveChanges() {
    if (!item) return;
    await updateMutation.mutateAsync({
      id: item.id,
      payload: {
        title: title.trim(),
        summary: summary.trim(),
        actionsTaken: actionsTaken.trim(),
        priority,
        riskLevel,
        status,
        followUpAt: followUpAt || null
      }
    });
  }

  async function removeCase() {
    if (!item) return;
    await deleteMutation.mutateAsync(item.id);
    onClose();
  }

  async function sendResponse() {
    if (!item || response.trim().length < 2) return;
    await commentMutation.mutateAsync({ id: item.id, body: response.trim() });
    setResponse("");
  }

  async function acknowledgeReceipt() {
    if (!item) return;
    await acknowledgeMutation.mutateAsync(item.id);
  }

  return (
    <aside className="fixed inset-y-0 right-0 z-40 w-full max-w-xl overflow-y-auto border-l bg-background p-6 shadow-xl">
      {detailQuery.isLoading ? <LoadingState rows={6} /> : null}
      {!detailQuery.isLoading && !item ? (
        <p className="text-sm text-destructive">
          {errorMessage ? `No fue posible cargar el seguimiento: ${errorMessage}` : "No fue posible cargar el seguimiento."}
        </p>
      ) : null}
      {item ? (
        <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Detalle de seguimiento</p>
          <h2 className="mt-1 text-xl font-semibold">{item.title}</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {item.student.firstName} {item.student.lastName} · {item.student.grade}
          </p>
        </div>
        <Button variant="outline" onClick={onClose}>
          Cerrar
        </Button>
      </div>
      <div className="mt-6 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="detail-case-title">Titulo</Label>
          <Input id="detail-case-title" disabled={!canUpdate} value={title} onChange={(event) => setTitle(event.target.value)} />
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="detail-case-status">Estado</Label>
            <select
              id="detail-case-status"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={!canUpdate}
              value={status}
              onChange={(event) => setStatus(event.target.value as CaseStatus)}
            >
              {CASE_STATUSES.map((caseStatus) => (
                <option key={caseStatus} value={caseStatus}>
                  {caseStatus}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="detail-case-priority">Prioridad</Label>
            <select
              id="detail-case-priority"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={!canUpdate}
              value={priority}
              onChange={(event) => setPriority(event.target.value as CaseListItem["priority"])}
            >
              {CASE_PRIORITIES.map((casePriority) => (
                <option key={casePriority} value={casePriority}>
                  {casePriority}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="detail-case-risk">Riesgo</Label>
            <select
              id="detail-case-risk"
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              disabled={!canUpdate}
              value={riskLevel}
              onChange={(event) => setRiskLevel(event.target.value as RiskLevel)}
            >
              {RISK_LEVELS.map((itemRisk) => (
                <option key={itemRisk} value={itemRisk}>
                  {itemRisk}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="detail-case-summary">Resumen</Label>
          <textarea
            id="detail-case-summary"
            className="min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={!canUpdate}
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="detail-case-actions">Acciones realizadas</Label>
          <textarea
            id="detail-case-actions"
            className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            disabled={!canUpdate}
            value={actionsTaken}
            onChange={(event) => setActionsTaken(event.target.value)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="detail-case-follow-up">Proximo seguimiento</Label>
          <Input
            id="detail-case-follow-up"
            disabled={!canUpdate}
            type="datetime-local"
            value={followUpAt}
            onChange={(event) => setFollowUpAt(event.target.value)}
          />
        </div>
        <div className="rounded-md border p-4 text-sm text-muted-foreground">
          <p>Apertura: {new Date(item.openedAt).toLocaleDateString("es-CO")}</p>
          <p>Responsable: {item.assignedTo?.name ?? "Sin responsable"}</p>
          <p>Eventos: {item._count.events} · Comentarios: {item._count.comments}</p>
        </div>
        <div className="rounded-md border p-4">
          <p className="text-sm font-medium">Respuestas y trazabilidad</p>
          <div className="mt-3 space-y-3">
            {item.comments.length ? (
              item.comments.map((comment) => (
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
              <Label htmlFor="case-response">Respuesta del rector o directivo</Label>
              <textarea
                id="case-response"
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
                Como acudiente solo puedes revisar el seguimiento y confirmar su recibido.
              </p>
              <Button
                disabled={item.acknowledgedByCurrentUser || acknowledgeMutation.isPending}
                onClick={acknowledgeReceipt}
              >
                {item.acknowledgedByCurrentUser ? "Recibido confirmado" : "Confirmar recibido"}
              </Button>
            </div>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button disabled={!canUpdate || updateMutation.isPending} onClick={saveChanges}>
            Guardar cambios
          </Button>
          <Button variant="destructive" disabled={!canUpdate || deleteMutation.isPending} onClick={removeCase}>
            Eliminar seguimiento
          </Button>
        </div>
      </div>
        </>
      ) : null}
    </aside>
  );
}

function MetricsStrip({ data }: { data: MonitoringOverview }) {
  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
      <MetricCard title="Criticos" value={String(data.metrics.critical)} change="prioridad" tone="danger" />
      <MetricCard title="Riesgo alto" value={String(data.metrics.high)} change="alto" tone="warning" />
      <MetricCard title="Riesgo medio" value={String(data.metrics.medium)} change="medio" tone="default" />
      <MetricCard title="Riesgo bajo" value={String(data.metrics.low)} change="estable" tone="success" />
      <MetricCard title="Alertas activas" value={String(data.metrics.activeAlerts)} change="abiertas" tone="warning" />
    </section>
  );
}

export function MonitoringView() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const filters = useMemo(() => ({ search }), [search]);
  const metricsQuery = useMonitoringOverview(filters);
  const casesQuery = useCases(filters);

  if (metricsQuery.isLoading || casesQuery.isLoading) return <LoadingState rows={7} />;
  if (metricsQuery.isError || casesQuery.isError) return <p className="text-sm text-destructive">No fue posible cargar seguimiento.</p>;
  if (!metricsQuery.data || !casesQuery.data) return null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Seguimiento institucional"
        description="El super admin puede revisar, crear, editar y eliminar seguimientos a partir de los casos activos."
      />
      <MetricsStrip data={metricsQuery.data} />
      <CaseCreateForm />
      <Card>
        <CardHeader className="gap-4 md:flex-row md:items-center md:justify-between">
          <CardTitle>Bandeja de seguimientos</CardTitle>
          <Input
            className="max-w-sm"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar estudiante, caso o resumen"
          />
        </CardHeader>
        <CardContent>
          {casesQuery.data.data.length ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b text-muted-foreground">
                  <tr>
                    <th className="py-3 font-medium">Caso</th>
                    <th className="py-3 font-medium">Estudiante</th>
                    <th className="py-3 font-medium">Estado</th>
                    <th className="py-3 font-medium">Prioridad</th>
                    <th className="py-3 font-medium">Riesgo</th>
                    <th className="py-3 font-medium">Responsable</th>
                    <th className="py-3 font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {casesQuery.data.data.map((item) => (
                    <tr key={item.id} className="cursor-pointer hover:bg-muted/40" onClick={() => setSelectedId(item.id)}>
                      <td className="py-3 font-medium">{item.title}</td>
                      <td className="py-3">
                        {item.student.firstName} {item.student.lastName}
                      </td>
                      <td className="py-3">{item.status}</td>
                      <td className="py-3">
                        <RiskBadge value={item.priority} />
                      </td>
                      <td className="py-3">
                        <RiskBadge value={item.riskLevel} />
                      </td>
                      <td className="py-3">{item.assignedTo?.name ?? "Sin responsable"}</td>
                      <td className="py-3">{new Date(item.openedAt).toLocaleDateString("es-CO")}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <EmptyState title="Sin seguimientos" description="No hay casos que coincidan con los filtros actuales." />
          )}
        </CardContent>
      </Card>
      {selectedId ? <CaseDetail caseId={selectedId} onClose={() => setSelectedId(null)} /> : null}
    </div>
  );
}

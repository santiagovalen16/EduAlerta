import { AlertTriangle, BarChart3, Building2, CheckCircle2, ClipboardList, Map, ShieldCheck, Siren, Users } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { serverApiFetch } from "@/lib/api/server-client";
import type { AuthUser, RoleKey } from "@/lib/auth/types";
import type { MonitoringOverview, TerritorialOverview } from "@/types/dashboard";

type RoleWorkspaceKind = "admin" | "secretaria" | "rector" | "coordinator" | "teacher" | "guardian" | "student";

type InstitutionDashboard = {
  metrics: {
    students: number;
    atRiskStudents: number;
    criticalStudents: number;
    activeAlerts: number;
    attendanceRate: number;
  };
  recentAlerts: Array<{
    id: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
    student: { firstName: string; lastName: string };
  }>;
};

type PublicStats = {
  students: number;
  activeAlerts: number;
  institutions: number;
  municipalities: number;
};

const roleCopy: Record<RoleWorkspaceKind, { role: RoleKey; title: string; description: string }> = {
  admin: {
    role: "SUPER_ADMIN",
    title: "Administracion global",
    description: "Gobierno de plataforma, instituciones, roles, permisos y salud operacional."
  },
  secretaria: {
    role: "SECRETARIA",
    title: "Secretaria de Educacion",
    description: "Lectura territorial de municipios, instituciones conectadas y concentracion de alertas."
  },
  rector: {
    role: "RECTOR",
    title: "Rectoria institucional",
    description: "Estado de riesgo, permanencia y seguimiento dentro de la institucion."
  },
  coordinator: {
    role: "COORDINADOR",
    title: "Coordinacion de seguimiento",
    description: "Priorizacion de casos, alertas escaladas y acompanamiento institucional."
  },
  teacher: {
    role: "DOCENTE",
    title: "Panel docente",
    description: "Trabajo diario con estudiantes, alertas academicas y seguimiento de aula."
  },
  guardian: {
    role: "ACUDIENTE",
    title: "Panel de acudiente",
    description: "Seguimiento de hijos, alertas abiertas y acciones de acompanamiento familiar."
  },
  student: {
    role: "ESTUDIANTE",
    title: "Mi trayectoria academica",
    description: "Resumen personal de rendimiento, asistencia, observaciones y alertas."
  }
};

export async function RoleWorkspace({ kind }: { kind: RoleWorkspaceKind }) {
  const user = await serverApiFetch<AuthUser>("/api/auth/me");
  const [institution, territorial, monitoring, publicStats] = await Promise.all([
    user.permissions.includes("dashboard:institution:read") ? safeFetch<InstitutionDashboard>("/api/dashboard/institution") : Promise.resolve(null),
    user.permissions.includes("dashboard:territory:read") ? safeFetch<TerritorialOverview>("/api/territorial/overview") : Promise.resolve(null),
    user.permissions.includes("student:read") ? safeFetch<MonitoringOverview>("/api/monitoring?page=1&pageSize=5") : Promise.resolve(null),
    safeFetch<PublicStats>("/api/public/stats")
  ]);
  const copy = roleCopy[kind];

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="default">{copy.role}</Badge>
            <span className="text-sm text-muted-foreground">{user.institution?.name ?? "EduAlerta"}</span>
          </div>
          <h1 className="mt-3 text-2xl font-semibold tracking-normal">{copy.title}</h1>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{copy.description}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {user.permissions.includes("alert:read") ? (
            <Button asChild>
              <Link href={"/dashboard/alerts" as Route}>
                <Siren className="h-4 w-4" />
                Alertas
              </Link>
            </Button>
          ) : null}
          {user.permissions.includes("student:read") ? (
            <Button variant="outline" asChild>
              <Link href={"/dashboard/monitoring" as Route}>
                <Users className="h-4 w-4" />
                Seguimiento
              </Link>
            </Button>
          ) : null}
        </div>
      </header>

      {kind === "admin" ? <AdminView stats={publicStats} institution={institution} territorial={territorial} /> : null}
      {kind === "secretaria" ? <SecretariaView territorial={territorial} stats={publicStats} /> : null}
      {kind === "rector" ? <RectorView institution={institution} monitoring={monitoring} /> : null}
      {kind === "coordinator" ? <CoordinatorView institution={institution} monitoring={monitoring} /> : null}
      {kind === "teacher" ? <TeacherView institution={institution} monitoring={monitoring} /> : null}
      {kind === "guardian" ? <GuardianView user={user} institution={institution} /> : null}
      {kind === "student" ? <StudentView user={user} institution={institution} /> : null}
    </div>
  );
}

async function safeFetch<T>(path: string) {
  try {
    return await serverApiFetch<T>(path);
  } catch {
    return null;
  }
}

function AdminView({ stats, institution, territorial }: { stats: PublicStats | null; institution: InstitutionDashboard | null; territorial: TerritorialOverview | null }) {
  return (
    <>
      <MetricGrid
        metrics={[
          ["Usuarios activos", institution?.metrics.students ?? stats?.students ?? 0, ShieldCheck],
          ["Instituciones", stats?.institutions ?? 0, Building2],
          ["Municipios", stats?.municipalities ?? 0, Map],
          ["Alertas abiertas", stats?.activeAlerts ?? institution?.metrics.activeAlerts ?? 0, Siren]
        ]}
      />
      <div className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <Panel title="Gobierno de plataforma" description="Tareas criticas para operar EduAlerta como SaaS institucional.">
          <Checklist items={["Revisar permisos y roles activos", "Auditar sesiones y actividad reciente", "Validar instituciones conectadas", "Preparar invitaciones institucionales"]} />
        </Panel>
        <Panel title="Cobertura territorial" description="Resumen conectado a datos de municipios e instituciones.">
          <List items={(territorial?.table ?? []).slice(0, 5).map((item) => `${item.municipality} · ${item.institution} · ${item.alerts} alertas`)} empty="Sin datos territoriales disponibles." />
        </Panel>
      </div>
    </>
  );
}

function SecretariaView({ territorial, stats }: { territorial: TerritorialOverview | null; stats: PublicStats | null }) {
  return (
    <>
      <MetricGrid
        metrics={[
          ["Municipios monitoreados", territorial?.kpis.monitoredMunicipalities ?? stats?.municipalities ?? 0, Map],
          ["Instituciones conectadas", territorial?.kpis.connectedInstitutions ?? stats?.institutions ?? 0, Building2],
          ["Alertas activas", territorial?.kpis.activeAlerts ?? stats?.activeAlerts ?? 0, Siren],
          ["Riesgo critico", territorial?.kpis.criticalRisk ?? 0, AlertTriangle]
        ]}
      />
      <Panel title="Ranking territorial" description="Municipios e instituciones con mayor concentracion de alertas.">
        <List items={(territorial?.table ?? []).slice(0, 8).map((row) => `${row.municipality} · ${row.institution} · riesgo ${row.riskAverage}`)} empty="Sin datos territoriales disponibles." />
      </Panel>
    </>
  );
}

function RectorView({ institution, monitoring }: { institution: InstitutionDashboard | null; monitoring: MonitoringOverview | null }) {
  return (
    <>
      <InstitutionMetrics institution={institution} />
      <div className="grid gap-4 lg:grid-cols-2">
        <RecentAlerts alerts={institution?.recentAlerts ?? []} />
        <Panel title="Estudiantes prioritarios" description="Casos que requieren seguimiento directivo.">
          <List items={(monitoring?.data ?? []).slice(0, 5).map((student) => `${student.student} · ${student.riskLevel} · ${student.activeAlerts} alertas`)} empty="Sin estudiantes priorizados." />
        </Panel>
      </div>
    </>
  );
}

function CoordinatorView({ institution, monitoring }: { institution: InstitutionDashboard | null; monitoring: MonitoringOverview | null }) {
  return (
    <>
      <MetricGrid
        metrics={[
          ["Casos criticos", monitoring?.metrics.critical ?? institution?.metrics.criticalStudents ?? 0, AlertTriangle],
          ["Riesgo alto", monitoring?.metrics.high ?? 0, Siren],
          ["Riesgo medio", monitoring?.metrics.medium ?? 0, ClipboardList],
          ["Alertas activas", monitoring?.metrics.activeAlerts ?? institution?.metrics.activeAlerts ?? 0, BarChart3]
        ]}
      />
      <Panel title="Bandeja de seguimiento" description="Casos recientes para priorizar, escalar o cerrar.">
        <List items={(monitoring?.data ?? []).map((student) => `${student.student} · asistencia ${student.attendanceRate}% · promedio ${student.academicAverage}`)} empty="No hay casos en seguimiento." />
      </Panel>
    </>
  );
}

function TeacherView({ institution, monitoring }: { institution: InstitutionDashboard | null; monitoring: MonitoringOverview | null }) {
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
          <Checklist items={["Crear alerta academica", "Revisar estudiantes en riesgo", "Actualizar asistencia", "Consultar observaciones recientes"]} />
        </Panel>
        <RecentAlerts alerts={institution?.recentAlerts ?? []} />
      </div>
    </>
  );
}

function GuardianView({ user, institution }: { user: AuthUser; institution: InstitutionDashboard | null }) {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel title="Acompanamiento familiar" description={`Sesion de ${user.name}. Informacion filtrada por permisos de acudiente.`}>
        <Checklist items={["Consultar alertas abiertas", "Revisar observaciones institucionales", "Confirmar acciones de seguimiento", "Actualizar datos de contacto"]} />
      </Panel>
      <Panel title="Resumen disponible" description="Datos visibles para el acudiente segun autorizacion institucional.">
        <List items={(institution?.recentAlerts ?? []).slice(0, 4).map((alert) => `${alert.student.firstName} ${alert.student.lastName} · ${alert.status}`)} empty="No hay alertas visibles para esta cuenta." />
      </Panel>
    </div>
  );
}

function StudentView({ user, institution }: { user: AuthUser; institution: InstitutionDashboard | null }) {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
      <Panel title="Mi progreso" description={`Hola, ${user.name}. Este panel resume tu trayectoria academica.`}>
        <Checklist items={["Revisar asistencia", "Consultar alertas y observaciones", "Ver compromisos de seguimiento", "Actualizar preferencias"]} />
      </Panel>
      <Panel title="Alertas y acompanamiento" description="Informacion compartida por la institucion.">
        <List items={(institution?.recentAlerts ?? []).slice(0, 4).map((alert) => `${alert.description} · ${alert.status}`)} empty="No tienes alertas visibles." />
      </Panel>
    </div>
  );
}

function InstitutionMetrics({ institution }: { institution: InstitutionDashboard | null }) {
  return (
    <MetricGrid
      metrics={[
        ["Estudiantes", institution?.metrics.students ?? 0, Users],
        ["En riesgo", institution?.metrics.atRiskStudents ?? 0, AlertTriangle],
        ["Criticos", institution?.metrics.criticalStudents ?? 0, Siren],
        ["Asistencia", `${institution?.metrics.attendanceRate ?? 0}%`, CheckCircle2]
      ]}
    />
  );
}

function MetricGrid({ metrics }: { metrics: Array<[string, number | string, typeof Users]> }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {metrics.map(([label, value, Icon]) => (
        <Card key={label}>
          <CardContent className="p-4">
            <Icon className="h-4 w-4 text-primary" />
            <p className="mt-3 text-2xl font-semibold">{typeof value === "number" ? value.toLocaleString("es-CO") : value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function Panel({ title, description, children }: { title: string; description: string; children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function RecentAlerts({ alerts }: { alerts: InstitutionDashboard["recentAlerts"] }) {
  return (
    <Panel title="Alertas recientes" description="Eventos registrados por docentes y equipos institucionales.">
      <List items={alerts.slice(0, 5).map((alert) => `${alert.student.firstName} ${alert.student.lastName} · ${alert.priority} · ${alert.description}`)} empty="Sin alertas recientes." />
    </Panel>
  );
}

function List({ items, empty }: { items: string[]; empty: string }) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{empty}</p>;
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item} className="rounded-md border px-3 py-2 text-sm">
          {item}
        </div>
      ))}
    </div>
  );
}

function Checklist({ items }: { items: string[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item} className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          {item}
        </div>
      ))}
    </div>
  );
}

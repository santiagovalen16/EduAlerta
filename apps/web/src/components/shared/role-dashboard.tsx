import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { serverApiFetch } from "@/lib/api/server-client";

type CurrentUser = {
  name: string;
  role: string;
  permissions: string[];
  institution: { name: string } | null;
};

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

export async function RoleDashboard({ expectedRole }: { expectedRole: string }) {
  const user = await serverApiFetch<CurrentUser>("/api/auth/me");
  const dashboard = user.permissions.includes("dashboard:institution:read")
    ? await serverApiFetch<InstitutionDashboard>("/api/dashboard/institution")
    : null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Dashboard {expectedRole.toLowerCase()}</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sesion activa para {user.name} en {user.institution?.name ?? "EduAlerta"}.
        </p>
      </div>
      {dashboard ? (
        <div className="grid gap-3 md:grid-cols-5">
          <Metric label="Estudiantes" value={dashboard.metrics.students} />
          <Metric label="En riesgo" value={dashboard.metrics.atRiskStudents} />
          <Metric label="Criticos" value={dashboard.metrics.criticalStudents} />
          <Metric label="Alertas" value={dashboard.metrics.activeAlerts} />
          <Metric label="Asistencia" value={`${dashboard.metrics.attendanceRate}%`} />
        </div>
      ) : null}
      <Card>
        <CardHeader>
          <CardTitle>{dashboard ? "Alertas recientes" : "Permisos activos"}</CardTitle>
          <CardDescription>La navegacion, datos y accesos se calculan desde RBAC real.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {dashboard
            ? dashboard.recentAlerts.map((alert) => (
                <div key={alert.id} className="rounded-md border p-3 text-sm">
                  <p className="font-medium">{alert.student.firstName} {alert.student.lastName}</p>
                  <p className="text-muted-foreground">{alert.description}</p>
                </div>
              ))
            : user.permissions.map((permission) => (
                <span key={permission} className="mr-2 inline-flex rounded-md border px-2 py-1 text-xs text-muted-foreground">
                  {permission}
                </span>
              ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-2xl font-semibold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </CardContent>
    </Card>
  );
}

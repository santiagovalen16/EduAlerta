import { AppShell } from "@/components/layout/app-shell";
import { SecurityPanel } from "@/components/settings/security-panel";
import { SettingsNav } from "@/components/settings/settings-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { serverApiFetch } from "@/lib/api/server-client";
import type { AuditLog, UserSession } from "@/services/users/users.service";

export default async function SettingsSecurityPage() {
  const [sessions, auditLogs] = await Promise.all([
    serverApiFetch<UserSession[]>("/api/users/me/sessions"),
    serverApiFetch<AuditLog[]>("/api/audit-logs/me")
  ]);

  return (
    <AppShell>
      <div className="flex flex-col gap-6 md:flex-row">
        <SettingsNav />
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Seguridad</CardTitle>
            <CardDescription>Contrasena, sesiones activas y actividad reciente.</CardDescription>
          </CardHeader>
          <CardContent>
            <SecurityPanel sessions={sessions} auditLogs={auditLogs} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

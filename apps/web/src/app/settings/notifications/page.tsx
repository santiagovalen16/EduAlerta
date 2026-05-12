import { AppShell } from "@/components/layout/app-shell";
import { NotificationsForm } from "@/components/settings/notifications-form";
import { SettingsNav } from "@/components/settings/settings-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { serverApiFetch } from "@/lib/api/server-client";
import type { UserProfile } from "@/services/users/users.service";

export default async function SettingsNotificationsPage() {
  const profile = await serverApiFetch<UserProfile>("/api/users/me");

  return (
    <AppShell>
      <div className="flex flex-col gap-6 md:flex-row">
        <SettingsNav />
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Notificaciones</CardTitle>
            <CardDescription>Canales y resumenes para alertas academicas.</CardDescription>
          </CardHeader>
          <CardContent>
            <NotificationsForm preferences={profile.preferences} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

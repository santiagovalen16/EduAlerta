import { AppShell } from "@/components/layout/app-shell";
import { PreferencesForm } from "@/components/settings/preferences-form";
import { SettingsNav } from "@/components/settings/settings-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { serverApiFetch } from "@/lib/api/server-client";
import type { UserProfile } from "@/services/users/users.service";

export default async function SettingsPreferencesPage() {
  const profile = await serverApiFetch<UserProfile>("/api/users/me");

  return (
    <AppShell>
      <div className="flex flex-col gap-6 md:flex-row">
        <SettingsNav />
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Preferencias</CardTitle>
            <CardDescription>Tema, idioma y accesibilidad.</CardDescription>
          </CardHeader>
          <CardContent>
            <PreferencesForm preferences={profile.preferences} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

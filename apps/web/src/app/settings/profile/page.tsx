import { AppShell } from "@/components/layout/app-shell";
import { ProfileForm } from "@/components/settings/profile-form";
import { SettingsNav } from "@/components/settings/settings-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { serverApiFetch } from "@/lib/api/server-client";
import type { UserProfile } from "@/services/users/users.service";

export default async function SettingsProfilePage() {
  const profile = await serverApiFetch<UserProfile>("/api/users/me");

  return (
    <AppShell>
      <div className="flex flex-col gap-6 md:flex-row">
        <SettingsNav />
        <Card className="flex-1">
          <CardHeader>
            <CardTitle>Perfil</CardTitle>
            <CardDescription>Datos visibles para tu institucion y trazabilidad de acciones.</CardDescription>
          </CardHeader>
          <CardContent>
            <ProfileForm profile={profile} />
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

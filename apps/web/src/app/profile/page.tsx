import { AppShell } from "@/components/layout/app-shell";
import { ProfileForm } from "@/components/settings/profile-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { serverApiFetch } from "@/lib/api/server-client";
import type { UserProfile } from "@/services/users/users.service";

export default async function ProfilePage() {
  const profile = await serverApiFetch<UserProfile>("/api/users/me");
  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6 grid gap-2 text-sm md:grid-cols-2">
            <p><span className="text-muted-foreground">Correo:</span> {profile.email}</p>
            <p><span className="text-muted-foreground">Rol:</span> {profile.role.name}</p>
          </div>
          <ProfileForm profile={profile} />
        </CardContent>
      </Card>
    </AppShell>
  );
}

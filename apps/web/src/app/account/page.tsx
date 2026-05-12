import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { serverApiFetch } from "@/lib/api/server-client";

export default async function AccountPage() {
  const user = await serverApiFetch<{ email: string; role: string; institution: { name: string } | null }>("/api/auth/me");
  return (
    <AppShell>
      <Card>
        <CardHeader>
          <CardTitle>Cuenta</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p>Correo: {user.email}</p>
          <p>Rol: {user.role}</p>
          <p>Institucion: {user.institution?.name ?? "Sin institucion"}</p>
        </CardContent>
      </Card>
    </AppShell>
  );
}

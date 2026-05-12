"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ShieldCheck } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AuditLog, UserSession } from "@/services/users/users.service";
import { changePassword, revokeSession } from "@/services/users/users.service";

const schema = z.object({
  currentPassword: z.string().min(8, "Ingresa tu contrasena actual."),
  newPassword: z.string().min(10, "La nueva contrasena debe tener al menos 10 caracteres.")
});

export function SecurityPanel({ sessions, auditLogs }: { sessions: UserSession[]; auditLogs: AuditLog[] }) {
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { currentPassword: "", newPassword: "" } });

  async function onSubmit(values: z.infer<typeof schema>) {
    await changePassword(values);
    form.reset();
    toast.success("Contrasena actualizada. Vuelve a iniciar sesion en tus dispositivos.");
  }

  async function onRevoke(id: string) {
    await revokeSession(id);
    toast.success("Sesion revocada");
  }

  return (
    <div className="space-y-6">
      <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="currentPassword">Contrasena actual</Label>
          <Input id="currentPassword" type="password" {...form.register("currentPassword")} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="newPassword">Nueva contrasena</Label>
          <Input id="newPassword" type="password" {...form.register("newPassword")} />
        </div>
        <Button type="submit" className="md:col-span-2 md:w-fit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Cambiar contrasena
        </Button>
      </form>
      <section>
        <h3 className="flex items-center gap-2 text-sm font-semibold">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Sesiones activas
        </h3>
        <div className="mt-3 space-y-3">
          {sessions.map((session) => (
            <div key={session.id} className="flex flex-col gap-3 rounded-md border p-3 text-sm sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium">{session.userAgent ?? "Dispositivo desconocido"}</p>
                <p className="text-muted-foreground">{session.ipAddress ?? "IP no disponible"} · expira {new Date(session.expiresAt).toLocaleDateString("es-CO")}</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onRevoke(session.id)} disabled={Boolean(session.revokedAt)}>
                {session.revokedAt ? "Revocada" : "Cerrar sesion"}
              </Button>
            </div>
          ))}
        </div>
      </section>
      <section>
        <h3 className="text-sm font-semibold">Actividad reciente</h3>
        <div className="mt-3 space-y-2">
          {auditLogs.map((log) => (
            <div key={log.id} className="rounded-md border px-3 py-2 text-sm">
              <p className="font-medium">{log.action}</p>
              <p className="text-xs text-muted-foreground">{log.entityType} · {new Date(log.createdAt).toLocaleString("es-CO")}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

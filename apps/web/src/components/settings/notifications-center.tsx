"use client";

import Link from "next/link";
import type { Route } from "next";
import { Bell, CheckCheck } from "lucide-react";
import { NotificationsForm } from "@/components/settings/notifications-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useMarkNotificationRead } from "@/hooks/mutations/use-mark-notification-read";
import { useNotifications } from "@/hooks/queries/use-notifications";
import type { UserPreferences } from "@/services/users/users.service";

export function NotificationsCenter({ preferences }: { preferences?: UserPreferences | null }) {
  const notificationsQuery = useNotifications();
  const markReadMutation = useMarkNotificationRead();

  return (
    <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
      <Card>
        <CardHeader>
          <CardTitle>Bandeja de notificaciones</CardTitle>
          <CardDescription>Alertas, respuestas y confirmaciones recientes dentro de la plataforma.</CardDescription>
        </CardHeader>
        <CardContent>
          {notificationsQuery.isLoading ? (
            <p className="text-sm text-muted-foreground">Cargando notificaciones...</p>
          ) : notificationsQuery.isError ? (
            <p className="text-sm text-destructive">No fue posible cargar la bandeja.</p>
          ) : notificationsQuery.data?.length ? (
            <div className="space-y-3">
              {notificationsQuery.data.map((notification) => {
                const href = "/dashboard/alerts" as Route;
                const isRead = Boolean(notification.readAt);

                return (
                  <div key={notification.id} className="rounded-md border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium">{notification.title}</p>
                          <Badge variant={isRead ? "muted" : "warning"}>{isRead ? "Leida" : "Nueva"}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{notification.body}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleString("es-CO")}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!isRead ? (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={markReadMutation.isPending}
                            onClick={() => markReadMutation.mutate(notification.id)}
                          >
                            <CheckCheck className="h-4 w-4" />
                            Marcar leida
                          </Button>
                        ) : null}
                        <Button asChild size="sm">
                          <Link href={href}>Abrir modulo</Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-dashed py-12 text-center">
              <Bell className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">Sin notificaciones</p>
                <p className="text-sm text-muted-foreground">Cuando haya actividad relevante aparecerá aquí.</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Preferencias</CardTitle>
          <CardDescription>Configura cómo quieres recibir los avisos del sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <NotificationsForm preferences={preferences} />
        </CardContent>
      </Card>
    </div>
  );
}

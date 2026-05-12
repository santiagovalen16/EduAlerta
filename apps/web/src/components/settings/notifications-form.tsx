"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { UserPreferences } from "@/services/users/users.service";
import { updatePreferences } from "@/services/users/users.service";

export function NotificationsForm({ preferences }: { preferences?: UserPreferences | null }) {
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<UserPreferences>({
    emailNotifications: preferences?.emailNotifications ?? true,
    alertNotifications: preferences?.alertNotifications ?? true,
    digestFrequency: preferences?.digestFrequency ?? "daily"
  });

  async function save() {
    setSaving(true);
    try {
      await updatePreferences(state);
      toast.success("Notificaciones actualizadas");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <label className="flex items-center gap-3 rounded-md border p-3 text-sm">
        <input type="checkbox" checked={state.emailNotifications} onChange={(event) => setState({ ...state, emailNotifications: event.target.checked })} />
        Notificaciones por correo
      </label>
      <label className="flex items-center gap-3 rounded-md border p-3 text-sm">
        <input type="checkbox" checked={state.alertNotifications} onChange={(event) => setState({ ...state, alertNotifications: event.target.checked })} />
        Notificaciones de alertas academicas
      </label>
      <div className="space-y-2">
        <Label htmlFor="digestFrequency">Resumen periodico</Label>
        <select id="digestFrequency" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={state.digestFrequency} onChange={(event) => setState({ ...state, digestFrequency: event.target.value as UserPreferences["digestFrequency"] })}>
          <option value="daily">Diario</option>
          <option value="weekly">Semanal</option>
          <option value="disabled">Desactivado</option>
        </select>
      </div>
      <Button onClick={save} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Guardar notificaciones
      </Button>
    </div>
  );
}

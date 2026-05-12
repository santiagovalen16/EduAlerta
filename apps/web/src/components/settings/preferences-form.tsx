"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import type { UserPreferences } from "@/services/users/users.service";
import { updatePreferences } from "@/services/users/users.service";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export function PreferencesForm({ preferences }: { preferences?: UserPreferences | null }) {
  const [saving, setSaving] = useState(false);
  const [state, setState] = useState<UserPreferences>({
    language: preferences?.language ?? "es",
    theme: preferences?.theme ?? "system",
    reducedMotion: preferences?.reducedMotion ?? false,
    highContrast: preferences?.highContrast ?? false
  });

  async function save() {
    setSaving(true);
    try {
      await updatePreferences(state);
      if (state.theme) {
        localStorage.setItem("edualerta.theme", state.theme);
        const dark = state.theme === "dark" || (state.theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
        document.documentElement.classList.toggle("dark", dark);
      }
      toast.success("Preferencias actualizadas");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="theme">Tema</Label>
          <select id="theme" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={state.theme} onChange={(event) => setState({ ...state, theme: event.target.value as UserPreferences["theme"] })}>
            <option value="system">Sistema</option>
            <option value="light">Claro</option>
            <option value="dark">Oscuro</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="language">Idioma</Label>
          <select id="language" className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={state.language} onChange={(event) => setState({ ...state, language: event.target.value as UserPreferences["language"] })}>
            <option value="es">Espanol</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>
      <label className="flex items-center gap-3 rounded-md border p-3 text-sm">
        <input type="checkbox" checked={state.reducedMotion} onChange={(event) => setState({ ...state, reducedMotion: event.target.checked })} />
        Reducir movimiento
      </label>
      <label className="flex items-center gap-3 rounded-md border p-3 text-sm">
        <input type="checkbox" checked={state.highContrast} onChange={(event) => setState({ ...state, highContrast: event.target.checked })} />
        Alto contraste
      </label>
      <Button onClick={save} disabled={saving}>
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Guardar preferencias
      </Button>
    </div>
  );
}

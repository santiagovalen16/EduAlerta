import Link from "next/link";
import type { Route } from "next";

export function SettingsNav() {
  return (
    <nav className="grid gap-2 md:w-64" aria-label="Configuracion">
      <Link className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary" href={"/settings/profile" as Route}>
        Perfil
      </Link>
      <Link className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary" href={"/settings/security" as Route}>
        Seguridad
      </Link>
      <Link className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary" href={"/settings/preferences" as Route}>
        Preferencias
      </Link>
      <Link className="rounded-md px-3 py-2 text-sm font-medium hover:bg-secondary" href={"/settings/notifications" as Route}>
        Notificaciones
      </Link>
    </nav>
  );
}

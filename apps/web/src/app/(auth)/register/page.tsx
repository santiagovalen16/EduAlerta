import Link from "next/link";
import type { Route } from "next";
import { AuthShell } from "@/components/auth/auth-shell";

export default function RegisterPage() {
  return (
    <AuthShell
      title="Registro por invitacion"
      description="EduAlerta no permite registros abiertos. Cada usuario debe ser invitado por una institucion o entidad autorizada."
      footer={
        <span>
          Tienes un token?{" "}
          <Link href={"/activate-account" as Route} className="font-medium text-primary hover:underline">
            Activar cuenta
          </Link>
        </span>
      }
    >
      <div className="rounded-md border bg-secondary p-4 text-sm leading-6 text-muted-foreground">
        Solicita a tu rector, coordinador o administrador territorial que cree una invitacion desde el panel de administracion.
      </div>
    </AuthShell>
  );
}

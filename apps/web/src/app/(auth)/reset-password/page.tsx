import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Suspense } from "react";

export default function ResetPasswordPage() {
  return (
    <AuthShell title="Crear nueva contrasena" description="Usa el token de recuperacion vigente y define una contrasena segura.">
      <Suspense fallback={<div className="h-44 animate-pulse rounded-md bg-secondary" />}>
        <ResetPasswordForm />
      </Suspense>
    </AuthShell>
  );
}

import { AuthShell } from "@/components/auth/auth-shell";
import { VerifyEmailForm } from "@/components/auth/verify-email-form";
import { Suspense } from "react";

export default function VerifyEmailPage() {
  return (
    <AuthShell title="Verificar correo" description="Confirma tu correo institucional con el token de verificacion.">
      <Suspense fallback={<div className="h-36 animate-pulse rounded-md bg-secondary" />}>
        <VerifyEmailForm />
      </Suspense>
    </AuthShell>
  );
}

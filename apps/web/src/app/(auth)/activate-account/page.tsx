import Link from "next/link";
import { ActivateAccountForm } from "@/components/auth/activate-account-form";
import { AuthShell } from "@/components/auth/auth-shell";
import { Suspense } from "react";

export default function ActivateAccountPage() {
  return (
    <AuthShell
      title="Activar cuenta institucional"
      description="Completa tus datos usando el token enviado por tu institucion."
      footer={
        <span>
          Ya tienes cuenta?{" "}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Ingresar
          </Link>
        </span>
      }
    >
      <Suspense fallback={<div className="h-64 animate-pulse rounded-md bg-secondary" />}>
        <ActivateAccountForm />
      </Suspense>
    </AuthShell>
  );
}

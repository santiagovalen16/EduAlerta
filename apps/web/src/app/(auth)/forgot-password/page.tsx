import Link from "next/link";
import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Recuperar acceso"
      description="Ingresa tu correo y enviaremos un enlace seguro para restablecer tu contrasena."
      footer={
        <Link href="/login" className="font-medium text-primary hover:underline">
          Volver al inicio de sesion
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}

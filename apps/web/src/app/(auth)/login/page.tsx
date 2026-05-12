import Link from "next/link";
import type { Route } from "next";
import { Suspense } from "react";
import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <AuthShell
      title="Ingresar a EduAlerta"
      description="Acceso seguro para equipos institucionales, acudientes y entidades territoriales."
      footer={
        <span>
          El registro es por invitacion institucional.{" "}
          <Link href={"/activate-account" as Route} className="font-medium text-primary hover:underline">
            Activar cuenta
          </Link>
        </span>
      }
    >
      <Suspense fallback={<div className="h-40 animate-pulse rounded-md bg-secondary" />}>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}

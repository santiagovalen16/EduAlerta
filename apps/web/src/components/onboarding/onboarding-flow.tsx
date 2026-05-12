"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getRoleDashboard } from "@/lib/auth/routing";
import type { AuthUser } from "@/lib/auth/types";
import { completeOnboarding, updateProfile } from "@/services/users/users.service";

const schema = z.object({
  name: z.string().min(2, "Ingresa tu nombre."),
  phone: z.string().optional(),
  position: z.string().optional(),
  theme: z.enum(["system", "light", "dark"]),
  digestFrequency: z.enum(["daily", "weekly", "disabled"])
});

export function OnboardingFlow({ user }: { user: AuthUser }) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: user.name,
      phone: "",
      position: "",
      theme: "system",
      digestFrequency: "daily"
    }
  });

  async function finish(values: z.infer<typeof schema>) {
    await updateProfile({ name: values.name, phone: values.phone ?? null, position: values.position ?? null, avatarUrl: "" });
    await completeOnboarding({
      theme: values.theme,
      language: "es",
      digestFrequency: values.digestFrequency,
      emailNotifications: true,
      alertNotifications: true
    });
    await fetch("/api/auth/refresh", { method: "POST" });
    toast.success("Configuracion inicial completada");
    router.replace(getRoleDashboard(user.role) as Route);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(finish)} className="mx-auto max-w-3xl rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-primary">Paso {step} de 4</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-normal">Configura tu espacio EduAlerta</h1>
        </div>
        <div className="hidden gap-2 sm:flex">
          {[1, 2, 3, 4].map((item) => (
            <span key={item} className={`h-2 w-10 rounded-full ${item <= step ? "bg-primary" : "bg-secondary"}`} />
          ))}
        </div>
      </div>

      {step === 1 ? (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="name">Nombre completo</Label>
            <Input id="name" {...form.register("name")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Telefono</Label>
            <Input id="phone" {...form.register("phone")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Cargo</Label>
            <Input id="position" {...form.register("position")} />
          </div>
        </section>
      ) : null}

      {step === 2 ? (
        <section className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="theme">Tema</Label>
            <select id="theme" className="h-10 w-full rounded-md border bg-background px-3 text-sm" {...form.register("theme")}>
              <option value="system">Sistema</option>
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="digestFrequency">Resumen</Label>
            <select id="digestFrequency" className="h-10 w-full rounded-md border bg-background px-3 text-sm" {...form.register("digestFrequency")}>
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="disabled">Desactivado</option>
            </select>
          </div>
        </section>
      ) : null}

      {step === 3 ? (
        <section className="space-y-3">
          <Check text={`Rol asignado: ${user.role}`} />
          <Check text={`Institucion: ${user.institution?.name ?? "Sin institucion asignada"}`} />
          <Check text="La navegacion se ajustara automaticamente a tus permisos." />
        </section>
      ) : null}

      {step === 4 ? (
        <section className="space-y-3 text-sm leading-6 text-muted-foreground">
          <Check text="Usa la busqueda rapida del encabezado para ir a alertas, estudiantes o configuracion." />
          <Check text="Las acciones sensibles quedan registradas en auditoria." />
          <Check text="Puedes actualizar notificaciones y accesibilidad desde Settings." />
        </section>
      ) : null}

      <div className="mt-8 flex justify-between">
        <Button type="button" variant="outline" onClick={() => setStep((value) => Math.max(1, value - 1))} disabled={step === 1}>
          Anterior
        </Button>
        {step < 4 ? (
          <Button type="button" onClick={() => setStep((value) => value + 1)}>
            Continuar
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Entrar a mi panel
          </Button>
        )}
      </div>
    </form>
  );
}

function Check({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-md border p-3">
      <CheckCircle2 className="mt-0.5 h-4 w-4 text-primary" />
      <span>{text}</span>
    </div>
  );
}

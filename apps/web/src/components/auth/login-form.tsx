"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "./form-message";

const schema = z.object({
  email: z.string().email("Ingresa un correo valido."),
  password: z.string().min(8, "La contrasena debe tener al menos 8 caracteres."),
  remember: z.boolean().optional()
});

type LoginValues = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "", remember: true }
  });

  async function onSubmit(values: LoginValues) {
    setFormError(null);
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const text = await response.text();
    let payload: { message?: string; redirectTo?: string } = {};
    if (text) {
      try {
        payload = JSON.parse(text) as { message?: string; redirectTo?: string };
      } catch {
        payload = { message: text };
      }
    }

    if (!response.ok) {
      setFormError(payload.message ?? "No fue posible iniciar sesion.");
      return;
    }

    toast.success("Sesion iniciada");
    router.replace((searchParams.get("next") ?? payload.redirectTo ?? "/dashboard") as Route);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {formError ? <FormMessage type="error">{formError}</FormMessage> : null}
      <div className="space-y-2">
        <Label htmlFor="email">Correo institucional</Label>
        <Input id="email" type="email" autoComplete="email" placeholder="usuario@institucion.edu.co" {...form.register("email")} />
        {form.formState.errors.email ? <p className="text-sm text-destructive">{form.formState.errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contrasena</Label>
        <div className="relative">
          <Input id="password" type={showPassword ? "text" : "password"} autoComplete="current-password" className="pr-10" {...form.register("password")} />
          <button
            type="button"
            className="absolute inset-y-0 right-2 inline-flex items-center text-muted-foreground"
            onClick={() => setShowPassword((current) => !current)}
            aria-label={showPassword ? "Ocultar contrasena" : "Mostrar contrasena"}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {form.formState.errors.password ? <p className="text-sm text-destructive">{form.formState.errors.password.message}</p> : null}
      </div>
      <div className="flex items-center justify-between gap-3">
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input type="checkbox" className="h-4 w-4 rounded border-input" {...form.register("remember")} />
          Mantener sesion
        </label>
        <a href="/forgot-password" className="text-sm font-medium text-primary hover:underline">
          Olvide mi contrasena
        </a>
      </div>
      <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Continuar
      </Button>
    </form>
  );
}

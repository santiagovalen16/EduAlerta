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
  email: z.string().email("Ingresa el correo invitado."),
  name: z.string().min(2, "Ingresa tu nombre completo."),
  phone: z.string().min(7, "Ingresa un telefono de contacto.").optional().or(z.literal("")),
  password: z.string().min(10, "Usa al menos 10 caracteres."),
  invitationToken: z.string().min(20, "El token de invitacion no es valido.")
});

type ActivateValues = z.infer<typeof schema>;

export function ActivateAccountForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<ActivateValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "",
      name: "",
      phone: "",
      password: "",
      invitationToken: searchParams.get("token") ?? ""
    }
  });

  async function onSubmit(values: ActivateValues) {
    setFormError(null);
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const payload = (await response.json()) as { message?: string; redirectTo?: string };

    if (!response.ok) {
      setFormError(payload.message ?? "No fue posible activar la cuenta.");
      return;
    }

    toast.success("Cuenta activada");
    router.replace((payload.redirectTo ?? "/onboarding") as Route);
    router.refresh();
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {formError ? <FormMessage type="error">{formError}</FormMessage> : null}
      <div className="space-y-2">
        <Label htmlFor="invitationToken">Token de invitacion</Label>
        <Input id="invitationToken" autoComplete="off" {...form.register("invitationToken")} />
        {form.formState.errors.invitationToken ? <p className="text-sm text-destructive">{form.formState.errors.invitationToken.message}</p> : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre completo</Label>
          <Input id="name" autoComplete="name" {...form.register("name")} />
          {form.formState.errors.name ? <p className="text-sm text-destructive">{form.formState.errors.name.message}</p> : null}
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Telefono</Label>
          <Input id="phone" autoComplete="tel" {...form.register("phone")} />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="email">Correo invitado</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        {form.formState.errors.email ? <p className="text-sm text-destructive">{form.formState.errors.email.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Contrasena</Label>
        <div className="relative">
          <Input id="password" type={showPassword ? "text" : "password"} autoComplete="new-password" className="pr-10" {...form.register("password")} />
          <button type="button" className="absolute inset-y-0 right-2 inline-flex items-center text-muted-foreground" onClick={() => setShowPassword((value) => !value)}>
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {form.formState.errors.password ? <p className="text-sm text-destructive">{form.formState.errors.password.message}</p> : null}
      </div>
      <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Activar cuenta
      </Button>
    </form>
  );
}

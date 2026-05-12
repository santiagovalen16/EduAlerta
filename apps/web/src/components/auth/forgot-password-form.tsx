"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "./form-message";

const schema = z.object({ email: z.string().email("Ingresa un correo valido.") });

export function ForgotPasswordForm() {
  const [message, setMessage] = useState<string | null>(null);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema), defaultValues: { email: "" } });

  async function onSubmit(values: z.infer<typeof schema>) {
    setMessage(null);
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const payload = (await response.json()) as { message?: string; resetToken?: string };
    if (!response.ok) {
      setMessage(payload.message ?? "No fue posible procesar la solicitud.");
      return;
    }
    setResetToken(payload.resetToken ?? null);
    setMessage("Si el correo existe, enviaremos instrucciones para restablecer la contrasena.");
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {message ? <FormMessage type={resetToken ? "info" : "success"}>{resetToken ? `Token local de desarrollo: ${resetToken}` : message}</FormMessage> : null}
      <div className="space-y-2">
        <Label htmlFor="email">Correo institucional</Label>
        <Input id="email" type="email" autoComplete="email" {...form.register("email")} />
        {form.formState.errors.email ? <p className="text-sm text-destructive">{form.formState.errors.email.message}</p> : null}
      </div>
      <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Enviar instrucciones
      </Button>
    </form>
  );
}

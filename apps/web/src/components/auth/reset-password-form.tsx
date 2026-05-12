"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "./form-message";

const schema = z.object({
  token: z.string().min(20, "Token invalido."),
  password: z.string().min(10, "Usa al menos 10 caracteres.")
});

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [formError, setFormError] = useState<string | null>(null);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { token: searchParams.get("token") ?? "", password: "" }
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setFormError(null);
    const response = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setFormError(payload.message ?? "No fue posible cambiar la contrasena.");
      return;
    }
    toast.success("Contrasena actualizada");
    router.replace("/login");
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {formError ? <FormMessage type="error">{formError}</FormMessage> : null}
      <div className="space-y-2">
        <Label htmlFor="token">Token de recuperacion</Label>
        <Input id="token" autoComplete="off" {...form.register("token")} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Nueva contrasena</Label>
        <Input id="password" type="password" autoComplete="new-password" {...form.register("password")} />
        {form.formState.errors.password ? <p className="text-sm text-destructive">{form.formState.errors.password.message}</p> : null}
      </div>
      <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Cambiar contrasena
      </Button>
    </form>
  );
}

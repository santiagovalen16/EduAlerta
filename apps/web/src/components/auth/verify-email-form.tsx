"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FormMessage } from "./form-message";

const schema = z.object({ token: z.string().min(20, "Token invalido.") });

export function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { token: searchParams.get("token") ?? "" }
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    setMessage(null);
    const response = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values)
    });
    const payload = (await response.json()) as { message?: string };
    setMessage(response.ok ? { type: "success", text: "Correo verificado correctamente." } : { type: "error", text: payload.message ?? "No fue posible verificar el correo." });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      {message ? <FormMessage type={message.type}>{message.text}</FormMessage> : null}
      <div className="space-y-2">
        <Label htmlFor="token">Token de verificacion</Label>
        <Input id="token" autoComplete="off" {...form.register("token")} />
      </div>
      <Button className="w-full" type="submit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Verificar correo
      </Button>
    </form>
  );
}

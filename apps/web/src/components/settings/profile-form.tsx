"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { UserProfile } from "@/services/users/users.service";
import { updateProfile } from "@/services/users/users.service";

const schema = z.object({
  name: z.string().min(2, "Ingresa tu nombre."),
  phone: z.string().optional(),
  position: z.string().optional(),
  avatarUrl: z.string().url("Usa una URL valida.").optional().or(z.literal(""))
});

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: profile.name,
      phone: profile.phone ?? "",
      position: profile.position ?? "",
      avatarUrl: profile.avatarUrl ?? ""
    }
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    await updateProfile({ ...values, phone: values.phone ?? null, position: values.position ?? null, avatarUrl: values.avatarUrl ?? null });
    toast.success("Perfil actualizado");
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4 md:grid-cols-2">
      <div className="space-y-2 md:col-span-2">
        <Label htmlFor="avatarUrl">Foto de perfil URL</Label>
        <Input id="avatarUrl" {...form.register("avatarUrl")} />
        {form.formState.errors.avatarUrl ? <p className="text-sm text-destructive">{form.formState.errors.avatarUrl.message}</p> : null}
      </div>
      <div className="space-y-2">
        <Label htmlFor="name">Nombre</Label>
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
      <div className="space-y-2">
        <Label>Institucion</Label>
        <Input value={profile.institution?.name ?? "Sin institucion asignada"} readOnly />
      </div>
      <Button type="submit" className="md:col-span-2 md:w-fit" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Guardar perfil
      </Button>
    </form>
  );
}

"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateObservationMutation } from "@/hooks/mutations/use-create-observation";

const schema = z.object({
  studentId: z.string().uuid(),
  category: z.enum(["BEHAVIOR", "COEXISTENCE", "ACADEMIC", "COMMITMENT", "POSITIVE", "NEGATIVE"]),
  severity: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
  title: z.string().min(3),
  description: z.string().min(5),
  followUpRequired: z.boolean().optional(),
  isPositive: z.boolean().optional()
});

export function ObservationForm({ students }: { students: Array<{ id: string; name: string }> }) {
  const router = useRouter();
  const createObservation = useCreateObservationMutation();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { studentId: students[0]?.id ?? "", category: "ACADEMIC", severity: "LOW", title: "", description: "", followUpRequired: false, isPositive: false }
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    createObservation.mutate(values, {
      onSuccess: () => {
        toast.success("Observacion registrada");
        form.reset({ ...form.getValues(), title: "", description: "" });
        router.refresh();
      },
      onError: () => toast.error("No fue posible registrar la observacion.")
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-2">
      <div className="space-y-2">
        <Label>Estudiante</Label>
        <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" {...form.register("studentId")}>
          {students.map((student) => <option key={student.id} value={student.id}>{student.name}</option>)}
        </select>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <select className="h-10 rounded-md border bg-background px-3 text-sm" {...form.register("category")}>
          <option value="ACADEMIC">Academico</option>
          <option value="BEHAVIOR">Comportamiento</option>
          <option value="COEXISTENCE">Convivencia</option>
          <option value="COMMITMENT">Compromiso</option>
          <option value="POSITIVE">Positiva</option>
          <option value="NEGATIVE">Negativa</option>
        </select>
        <select className="h-10 rounded-md border bg-background px-3 text-sm" {...form.register("severity")}>
          <option value="LOW">Baja</option>
          <option value="MEDIUM">Media</option>
          <option value="HIGH">Alta</option>
          <option value="CRITICAL">Critica</option>
        </select>
      </div>
      <Input placeholder="Titulo" {...form.register("title")} />
      <Input placeholder="Descripcion" {...form.register("description")} />
      <Button className="md:col-span-2 md:w-fit" disabled={createObservation.isPending || students.length === 0}>
        {createObservation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Registrar observacion
      </Button>
    </form>
  );
}

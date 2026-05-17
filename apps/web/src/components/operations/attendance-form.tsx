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
import { useCreateAttendanceMutation } from "@/hooks/mutations/use-create-attendance";

const schema = z.object({
  studentId: z.string().uuid(),
  courseId: z.string().uuid(),
  date: z.string().min(1),
  status: z.enum(["PRESENT", "LATE", "ABSENT", "JUSTIFIED"]),
  notes: z.string().optional()
});

export function AttendanceForm({ students }: { students: Array<{ id: string; name: string; courseId: string | null; course: string }> }) {
  const router = useRouter();
  const createAttendance = useCreateAttendanceMutation();
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { studentId: students[0]?.id ?? "", courseId: students[0]?.courseId ?? "", date: new Date().toISOString().slice(0, 10), status: "PRESENT", notes: "" }
  });

  async function onSubmit(values: z.infer<typeof schema>) {
    createAttendance.mutate(values, {
      onSuccess: () => {
        toast.success("Asistencia registrada");
        router.refresh();
      },
      onError: () => toast.error("No fue posible registrar la asistencia.")
    });
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-3 rounded-lg border bg-card p-4 md:grid-cols-5">
      <div className="space-y-2 md:col-span-2">
        <Label>Estudiante</Label>
        <select
          className="h-10 w-full rounded-md border bg-background px-3 text-sm"
          {...form.register("studentId")}
          onChange={(event) => {
            const student = students.find((item) => item.id === event.target.value);
            form.setValue("studentId", event.target.value);
            form.setValue("courseId", student?.courseId ?? "");
          }}
        >
          {students.map((student) => (
            <option key={student.id} value={student.id}>
              {student.name} · {student.course}
            </option>
          ))}
        </select>
      </div>
      <input type="hidden" {...form.register("courseId")} />
      <div className="space-y-2">
        <Label>Fecha</Label>
        <Input type="date" {...form.register("date")} />
      </div>
      <div className="space-y-2">
        <Label>Estado</Label>
        <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" {...form.register("status")}>
          <option value="PRESENT">Presente</option>
          <option value="LATE">Tarde</option>
          <option value="ABSENT">Ausente</option>
          <option value="JUSTIFIED">Justificado</option>
        </select>
      </div>
      <div className="space-y-2">
        <Label>Notas</Label>
        <Input {...form.register("notes")} />
      </div>
      <Button className="md:col-span-5 md:w-fit" disabled={createAttendance.isPending || students.length === 0}>
        {createAttendance.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Registrar asistencia
      </Button>
    </form>
  );
}

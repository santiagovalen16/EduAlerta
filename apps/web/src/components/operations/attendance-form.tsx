"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBulkAttendanceMutation } from "@/hooks/mutations/use-bulk-attendance";

const ATTENDANCE_STATUSES = ["PRESENT", "LATE", "ABSENT", "JUSTIFIED"] as const;

type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

type StudentRow = {
  id: string;
  name: string;
  courseId: string;
  course: string;
};

type ExistingRecord = {
  studentId: string;
  courseId: string;
  status: AttendanceStatus;
  notes: string | null;
};

type RowState = {
  status: AttendanceStatus;
  notes: string;
};

export function AttendanceForm({
  students,
  existingRecords
}: {
  students: StudentRow[];
  existingRecords: ExistingRecord[];
}) {
  const bulkMutation = useBulkAttendanceMutation();
  const today = new Date().toISOString().slice(0, 10);
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedCourseId, setSelectedCourseId] = useState("all");

  const courseOptions = useMemo(
    () =>
      [...new Map(students.map((student) => [student.courseId, { id: student.courseId, name: student.course }])).values()].sort((a, b) =>
        a.name.localeCompare(b.name, "es-CO")
      ),
    [students]
  );

  const initialRows = useMemo(() => {
    const recordMap = new Map(
      existingRecords.map((record) => [`${record.studentId}:${record.courseId}`, { status: record.status, notes: record.notes ?? "" }])
    );

    return Object.fromEntries(
      students.map((student) => [
        student.id,
        recordMap.get(`${student.id}:${student.courseId}`) ?? { status: "PRESENT", notes: "" }
      ])
    ) as Record<string, RowState>;
  }, [existingRecords, students]);

  const [rows, setRows] = useState<Record<string, RowState>>(initialRows);

  const visibleStudents = useMemo(
    () =>
      students
        .filter((student) => selectedCourseId === "all" || student.courseId === selectedCourseId)
        .sort((a, b) => a.course.localeCompare(b.course, "es-CO") || a.name.localeCompare(b.name, "es-CO")),
    [selectedCourseId, students]
  );

  function updateRow(studentId: string, patch: Partial<RowState>) {
    setRows((current) => ({
      ...current,
      [studentId]: {
        ...current[studentId],
        ...patch
      }
    }));
  }

  async function submitVisibleRoster() {
    if (visibleStudents.length === 0) {
      toast.error("No hay estudiantes disponibles para registrar asistencia.");
      return;
    }

    try {
      await bulkMutation.mutateAsync(
        visibleStudents.map((student) => ({
          studentId: student.id,
          courseId: student.courseId,
          date: selectedDate,
          status: rows[student.id]?.status ?? "PRESENT",
          notes: rows[student.id]?.notes?.trim() || undefined
        }))
      );
      toast.success(`Asistencia guardada para ${visibleStudents.length} estudiante(s).`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No fue posible registrar la asistencia.");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Planilla diaria de asistencia</CardTitle>
        <CardDescription>
          Registra la asistencia de los estudiantes actuales por curso. Si ya había un registro para hoy, lo verás precargado.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-[220px_260px_auto] md:items-end">
          <div className="space-y-2">
            <Label htmlFor="attendance-date">Fecha</Label>
            <Input id="attendance-date" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="attendance-course">Curso</Label>
            <select
              id="attendance-course"
              className="h-10 w-full rounded-md border bg-background px-3 text-sm"
              value={selectedCourseId}
              onChange={(event) => setSelectedCourseId(event.target.value)}
            >
              <option value="all">Todos los cursos</option>
              {courseOptions.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <Button type="button" disabled={bulkMutation.isPending || visibleStudents.length === 0} onClick={submitVisibleRoster}>
              {bulkMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Guardar planilla
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto rounded-md border">
          <table className="w-full min-w-[900px] text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left">
                <th className="px-4 py-3 font-medium">Estudiante</th>
                <th className="px-4 py-3 font-medium">Curso</th>
                <th className="px-4 py-3 font-medium">Estado</th>
                <th className="px-4 py-3 font-medium">Notas</th>
              </tr>
            </thead>
            <tbody>
              {visibleStudents.map((student) => (
                <tr key={student.id} className="border-t">
                  <td className="px-4 py-3 font-medium">{student.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{student.course}</td>
                  <td className="px-4 py-3">
                    <select
                      className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                      value={rows[student.id]?.status ?? "PRESENT"}
                      onChange={(event) => updateRow(student.id, { status: event.target.value as AttendanceStatus })}
                    >
                      <option value="PRESENT">Presente</option>
                      <option value="LATE">Tarde</option>
                      <option value="ABSENT">Ausente</option>
                      <option value="JUSTIFIED">Justificado</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <Input
                      value={rows[student.id]?.notes ?? ""}
                      onChange={(event) => updateRow(student.id, { notes: event.target.value })}
                      placeholder="Observacion opcional"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visibleStudents.length === 0 ? (
          <p className="text-sm text-muted-foreground">No hay estudiantes con curso asignado para el filtro seleccionado.</p>
        ) : null}
      </CardContent>
    </Card>
  );
}

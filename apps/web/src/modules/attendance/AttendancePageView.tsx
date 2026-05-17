import { AttendanceForm } from "@/components/operations/attendance-form";
import { OperationTable } from "@/components/operations/operation-table";
import { Badge } from "@/components/ui/badge";
import { serverApiFetch } from "@/lib/api/server-client";
import type { AuthUser } from "@/lib/auth/types";
import type { AttendanceResponse, StudentsResponse } from "./types";

export async function AttendancePageView() {
  const [user, students, attendance] = await Promise.all([
    serverApiFetch<AuthUser>("/api/auth/me"),
    serverApiFetch<StudentsResponse>("/api/students?page=1&pageSize=100"),
    serverApiFetch<AttendanceResponse>("/api/attendance?page=1&pageSize=50")
  ]);
  const selectable = students.data.filter((item) => item.course).map((item) => ({ id: item.id, name: `${item.firstName} ${item.lastName}`, courseId: item.course?.id ?? null, course: item.course?.name ?? "Sin curso" }));
  const canWriteAttendance = user.permissions.includes("attendance:write");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Asistencia</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {canWriteAttendance ? "Registro diario con estados presente, tarde, ausente y justificado." : "Consulta de asistencia de los estudiantes vinculados a tu cuenta."}
        </p>
      </div>
      {canWriteAttendance ? <AttendanceForm students={selectable} /> : null}
      <OperationTable
        title="Registros recientes"
        columns={["Estudiante", "Curso", "Fecha", "Estado", "Notas"]}
        rows={attendance.data.map((item) => [
          `${item.student.firstName} ${item.student.lastName}`,
          item.course.name,
          new Date(item.date).toLocaleDateString("es-CO"),
          <Badge key="status" variant={item.status === "ABSENT" ? "danger" : item.status === "LATE" ? "warning" : "success"}>{item.status}</Badge>,
          item.notes ?? "Sin notas"
        ])}
      />
    </div>
  );
}

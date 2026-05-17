import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getStudents } from "@/features/students/service";

export async function LegacyStudentsPageView({
  searchParams
}: {
  searchParams: Promise<{ search?: string; riskLevel?: string; page?: string }>;
}) {
  const students = await getStudents(await searchParams);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Estudiantes en seguimiento</CardTitle>
        <CardDescription>Consulta consolidada de estudiantes, acudientes, riesgo y alertas activas.</CardDescription>
      </CardHeader>
      <CardContent>
        {students.data.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="py-3 font-medium">Estudiante</th>
                  <th className="py-3 font-medium">Curso</th>
                  <th className="py-3 font-medium">Institucion</th>
                  <th className="py-3 font-medium">Riesgo</th>
                  <th className="py-3 font-medium">Alertas</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {students.data.map((student) => (
                  <tr key={student.id}>
                    <td className="py-3 font-medium">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="py-3">{student.course?.name ?? student.grade}</td>
                    <td className="py-3">{student.institution.name}</td>
                    <td className="py-3">
                      <Badge variant={student.riskLevel === "CRITICAL" ? "danger" : "default"}>{student.riskLevel}</Badge>
                    </td>
                    <td className="py-3">{student._count.alerts}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">No hay estudiantes registrados.</p>
        )}
      </CardContent>
    </Card>
  );
}

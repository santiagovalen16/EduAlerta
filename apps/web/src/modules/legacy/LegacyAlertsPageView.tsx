import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAlerts } from "@/features/alerts/service";

export async function LegacyAlertsPageView({
  searchParams
}: {
  searchParams: Promise<{ search?: string; status?: string; type?: string; page?: string }>;
}) {
  const alerts = await getAlerts(await searchParams);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alertas academicas</CardTitle>
        <CardDescription>Registro, seguimiento y cierre de alertas reportadas por docentes.</CardDescription>
      </CardHeader>
      <CardContent>
        {alerts.data.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="py-3 font-medium">Estudiante</th>
                  <th className="py-3 font-medium">Tipo</th>
                  <th className="py-3 font-medium">Estado</th>
                  <th className="py-3 font-medium">Descripcion</th>
                  <th className="py-3 font-medium">Docente</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {alerts.data.map((alert) => (
                  <tr key={alert.id}>
                    <td className="py-3 font-medium">
                      {alert.student.firstName} {alert.student.lastName}
                    </td>
                    <td className="py-3">
                      <Badge variant="default">{alert.type}</Badge>
                    </td>
                    <td className="py-3">{alert.status}</td>
                    <td className="max-w-md py-3 text-muted-foreground">{alert.description}</td>
                    <td className="py-3">{alert.createdBy.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="py-10 text-center text-sm text-muted-foreground">No hay alertas registradas.</p>
        )}
      </CardContent>
    </Card>
  );
}

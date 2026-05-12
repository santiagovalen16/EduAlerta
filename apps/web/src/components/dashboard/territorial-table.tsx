import { EmptyState } from "@/components/shared/data-state";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TerritorialOverview } from "@/types/dashboard";

export function TerritorialTable({ rows }: { rows: TerritorialOverview["table"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tabla territorial</CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b text-muted-foreground">
                <tr>
                  <th className="py-3 font-medium">Municipio</th>
                  <th className="py-3 font-medium">Institucion</th>
                  <th className="py-3 font-medium">Estudiantes</th>
                  <th className="py-3 font-medium">Alertas</th>
                  <th className="py-3 font-medium">Riesgo promedio</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {rows.map((row) => (
                  <tr key={row.id} className="hover:bg-muted/40">
                    <td className="py-3">{row.municipality}</td>
                    <td className="py-3 font-medium">{row.institution}</td>
                    <td className="py-3">{row.students}</td>
                    <td className="py-3">{row.alerts}</td>
                    <td className="py-3">{row.riskAverage}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState title="Sin instituciones" description="No hay instituciones territoriales registradas." />
        )}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function OperationTable({
  title,
  description,
  columns,
  rows,
  empty = "No hay registros disponibles."
}: {
  title: string;
  description?: string;
  columns: string[];
  rows: Array<Array<React.ReactNode>>;
  empty?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                {columns.map((column) => (
                  <th key={column} className="px-3 py-2 font-medium">
                    {column}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, index) => (
                <tr key={index} className="border-b last:border-0">
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex} className="px-3 py-3 align-top">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? <p className="py-8 text-center text-sm text-muted-foreground">{empty}</p> : null}
      </CardContent>
    </Card>
  );
}

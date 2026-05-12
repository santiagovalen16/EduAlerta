import { FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-normal">Reportes y exportaciones</h1>
        <p className="mt-1 text-sm text-muted-foreground">Exportaciones CSV listas para Excel. PDF/XLSX quedan preparados como siguiente provider.</p>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <ReportCard title="Alertas" description="Alertas academicas y de convivencia." href="/api/backend/reports/export?type=alerts" />
        <ReportCard title="Asistencia" description="Registros de asistencia por estudiante y curso." href="/api/backend/reports/export?type=attendance" />
      </div>
    </div>
  );
}

function ReportCard({ title, description, href }: { title: string; description: string; href: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild>
          <a href={href}>
            <FileDown className="h-4 w-4" />
            Exportar CSV
          </a>
        </Button>
      </CardContent>
    </Card>
  );
}

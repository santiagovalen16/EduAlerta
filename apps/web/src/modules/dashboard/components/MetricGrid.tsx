import { Card, CardContent } from "@/components/ui/card";
import type { DashboardMetric } from "../types";

export function MetricGrid({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <div className="grid gap-3 md:grid-cols-4">
      {metrics.map(([label, value, Icon]) => (
        <Card key={label}>
          <CardContent className="p-4">
            <Icon className="h-4 w-4 text-primary" />
            <p className="mt-3 text-2xl font-semibold">{typeof value === "number" ? value.toLocaleString("es-CO") : value}</p>
            <p className="text-xs text-muted-foreground">{label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

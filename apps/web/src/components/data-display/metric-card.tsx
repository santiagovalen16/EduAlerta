import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function MetricCard({
  title,
  value,
  change,
  tone = "default"
}: {
  title: string;
  value: string;
  change: string;
  tone?: "default" | "success" | "warning" | "danger";
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between">
        <p className="text-3xl font-semibold tracking-normal">{value}</p>
        <Badge variant={tone}>{change}</Badge>
      </CardContent>
    </Card>
  );
}

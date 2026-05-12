import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { TerritorialOverview } from "@/types/dashboard";

export function TerritorialMapPanel({ points }: { points: TerritorialOverview["map"] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Mapa territorial</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative min-h-80 overflow-hidden rounded-md border bg-secondary/40">
          <div className="absolute inset-0 grid place-items-center">
            <div className="w-full max-w-xl space-y-3 p-6">
              {points.map((point) => (
                <div key={point.id} className="flex items-center justify-between rounded-md border bg-background px-4 py-3 shadow-sm">
                  <div>
                    <p className="font-medium">{point.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {point.latitude ?? "lat pendiente"}, {point.longitude ?? "lng pendiente"}
                    </p>
                  </div>
                  <span className="text-sm font-semibold">{point.alerts}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

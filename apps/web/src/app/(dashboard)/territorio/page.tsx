import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function TerritoryPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Dashboard territorial</CardTitle>
        <CardDescription>Vista para Secretarias de Educacion con indicadores por municipio e institucion.</CardDescription>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        Este espacio queda reservado para mapas Leaflet, comparativos territoriales y reportes consolidados.
      </CardContent>
    </Card>
  );
}

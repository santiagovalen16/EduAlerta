import { Checklist, List, Panel } from "../components/Panel";
import type { DashboardData } from "../types";

export function StudentDashboardView({ user, institution }: DashboardData) {
  return (
    <div className="grid gap-4 lg:grid-cols-[0.85fr_1.15fr]">
      <Panel title="Mi progreso" description={`Hola, ${user.name}. Este panel resume tu trayectoria academica.`}>
        <Checklist items={["Revisar asistencia", "Consultar alertas y observaciones", "Ver compromisos de seguimiento", "Actualizar preferencias"]} />
      </Panel>
      <Panel title="Alertas y acompanamiento" description="Informacion compartida por la institucion.">
        <List items={(institution?.recentAlerts ?? []).slice(0, 4).map((alert) => `${alert.description} · ${alert.status}`)} empty="No tienes alertas visibles." />
      </Panel>
    </div>
  );
}

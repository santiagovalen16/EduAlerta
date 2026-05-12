import { Injectable } from "@nestjs/common";
import { TerritorialRepository } from "./territorial.repository";

@Injectable()
export class TerritorialService {
  constructor(private readonly territorialRepository: TerritorialRepository) {}

  async overview() {
    const [summary, municipalities, institutions, monthlyEvolution, riskDistribution] = await Promise.all([
      this.territorialRepository.summary(),
      this.territorialRepository.alertsByMunicipality(),
      this.territorialRepository.institutions(),
      this.territorialRepository.monthlyEvolution(),
      this.territorialRepository.riskDistribution()
    ]);

    const alertsByMunicipality = municipalities.map((municipality) => {
      const alerts = municipality.institutions.reduce(
        (total, institution) =>
          total + institution.students.reduce((inner, student) => inner + student.alerts.length, 0),
        0
      );
      return {
        id: municipality.id,
        name: municipality.name,
        latitude: municipality.latitude,
        longitude: municipality.longitude,
        alerts
      };
    });

    const institutionRows = institutions.map((institution) => {
      const alerts = institution.students.reduce((total, student) => total + student.alerts.length, 0);
      const riskScore =
        institution.students.reduce((total, student) => {
          const score = { LOW: 1, MEDIUM: 2, HIGH: 3, CRITICAL: 4 }[student.riskLevel];
          return total + score;
        }, 0) / Math.max(institution.students.length, 1);

      return {
        id: institution.id,
        institution: institution.name,
        municipality: institution.municipality.name,
        students: institution.students.length,
        alerts,
        riskAverage: Number(riskScore.toFixed(2))
      };
    });

    const monthMap = new Map<string, number>();
    for (const alert of monthlyEvolution) {
      const key = alert.createdAt.toISOString().slice(0, 7);
      monthMap.set(key, (monthMap.get(key) ?? 0) + 1);
    }

    return {
      kpis: {
        totalStudents: summary.students,
        activeAlerts: summary.activeAlerts,
        monitoredMunicipalities: summary.municipalities,
        connectedInstitutions: summary.institutions,
        criticalRisk: summary.criticalRisk,
        monthlyTrend: Array.from(monthMap.values()).at(-1) ?? 0
      },
      charts: {
        alertsByMunicipality,
        alertsByInstitution: institutionRows.map((row) => ({ name: row.institution, alerts: row.alerts })),
        monthlyEvolution: Array.from(monthMap.entries()).map(([month, alerts]) => ({ month, alerts })),
        riskDistribution: riskDistribution.map((item) => ({ riskLevel: item.riskLevel, count: item._count._all }))
      },
      table: institutionRows,
      map: alertsByMunicipality
    };
  }
}

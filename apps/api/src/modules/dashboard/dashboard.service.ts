import { Injectable } from "@nestjs/common";
import { DashboardRepository } from "./dashboard.repository";

@Injectable()
export class DashboardService {
  constructor(private readonly dashboardRepository: DashboardRepository) {}

  async institutionSummary() {
    const [metrics, riskTrend, alertsByType, priorityStudents, recentAlerts] = await Promise.all([
      this.dashboardRepository.metrics(),
      this.dashboardRepository.riskTrend(),
      this.dashboardRepository.alertsByType(),
      this.dashboardRepository.priorityStudents(),
      this.dashboardRepository.recentAlerts()
    ]);

    return {
      metrics,
      riskTrend: riskTrend.map((item) => ({ riskLevel: item.riskLevel, count: item._count._all })),
      alertsByType: alertsByType.map((item) => ({ type: item.type, count: item._count._all })),
      priorityStudents,
      recentAlerts
    };
  }
}

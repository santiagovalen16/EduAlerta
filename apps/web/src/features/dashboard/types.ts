export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AlertType = "ATTENDANCE" | "ACADEMIC" | "BEHAVIOR" | "FAMILY";
export type AlertStatus = "NEW" | "IN_REVIEW" | "ESCALATED" | "CLOSED";

export type DashboardSummary = {
  metrics: {
    totalStudents: number;
    highRiskStudents: number;
    criticalStudents: number;
    openAlerts: number;
    todayAlerts: number;
    attendanceAverage: number;
  };
  riskTrend: Array<{ riskLevel: RiskLevel; count: number }>;
  alertsByType: Array<{ type: AlertType; count: number }>;
  priorityStudents: Array<{
    id: string;
    firstName: string;
    lastName: string;
    grade: string;
    riskLevel: RiskLevel;
    course: { name: string } | null;
    alerts: Array<{ id: string; type: AlertType; description: string; status: AlertStatus }>;
    _count: { alerts: number; incidents: number };
  }>;
  recentAlerts: Array<{
    id: string;
    type: AlertType;
    status: AlertStatus;
    description: string;
    createdAt: string;
    student: { firstName: string; lastName: string; course: { name: string } | null };
    createdBy: { name: string; email: string };
  }>;
};

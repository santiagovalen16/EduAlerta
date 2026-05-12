export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AlertStatus = "NEW" | "IN_REVIEW" | "ESCALATED" | "CLOSED";
export type AlertType = "ATTENDANCE" | "ACADEMIC" | "BEHAVIOR" | "FAMILY";
export type AlertPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type TerritorialOverview = {
  kpis: {
    totalStudents: number;
    activeAlerts: number;
    monitoredMunicipalities: number;
    connectedInstitutions: number;
    criticalRisk: number;
    monthlyTrend: number;
  };
  charts: {
    alertsByMunicipality: Array<{ id: string; name: string; latitude: number | null; longitude: number | null; alerts: number }>;
    alertsByInstitution: Array<{ name: string; alerts: number }>;
    monthlyEvolution: Array<{ month: string; alerts: number }>;
    riskDistribution: Array<{ riskLevel: RiskLevel; count: number }>;
  };
  table: Array<{ id: string; municipality: string; institution: string; students: number; alerts: number; riskAverage: number }>;
  map: Array<{ id: string; name: string; latitude: number | null; longitude: number | null; alerts: number }>;
};

export type AlertListItem = {
  id: string;
  type: AlertType;
  status: AlertStatus;
  priority: AlertPriority;
  description: string;
  createdAt: string;
  student: { firstName: string; lastName: string; riskLevel: RiskLevel; course: { name: string } | null; institution: { name: string } };
  createdBy: { name: string; email: string };
  teacher: { user: { name: string; email: string } } | null;
};

export type MonitoringOverview = {
  metrics: { critical: number; high: number; medium: number; low: number; activeAlerts: number };
  data: Array<{
    id: string;
    student: string;
    course: string;
    institution: string;
    municipality: string;
    guardian: string | null;
    riskLevel: RiskLevel;
    activeAlerts: number;
    attendanceRate: number;
    academicAverage: number;
    timeline: Array<{ type: string; label: string; date: string }>;
  }>;
  meta: { total: number; page: number; pageSize: number };
};

export type PaginatedResponse<T> = { data: T[]; meta: { total: number; page: number; pageSize: number } };

export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type AlertStatus = "NEW" | "IN_REVIEW" | "ESCALATED" | "CLOSED";
export type AlertType = "ATTENDANCE" | "ACADEMIC" | "BEHAVIOR" | "FAMILY";
export type AlertPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
export type CaseStatus = "NEW" | "IN_REVIEW" | "ESCALATED" | "INTERVENTION" | "FOLLOW_UP" | "RESOLVED" | "CLOSED";

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

export type EntityComment = {
  id: string;
  body: string;
  createdAt: string;
  author: { id: string; name: string; email?: string } | null;
};

export type AlertDetail = AlertListItem & {
  acknowledgedByCurrentUser: boolean;
  comments: EntityComment[];
  student: AlertListItem["student"] & {
    guardians: Array<{ guardianId: string; guardian: { user: { id: string; name: string; email: string } | null } }>;
  };
};

export type StudentOption = {
  id: string;
  firstName: string;
  lastName: string;
  grade: string;
  riskLevel: RiskLevel;
  institution: { id: string; name: string };
};

export type CaseListItem = {
  id: string;
  title: string;
  summary: string;
  actionsTaken: string | null;
  status: CaseStatus;
  priority: AlertPriority;
  riskLevel: RiskLevel;
  openedAt: string;
  followUpAt: string | null;
  student: { id: string; firstName: string; lastName: string; grade: string; riskLevel: RiskLevel };
  assignedTo: { id: string; name: string; email: string } | null;
  openedBy: { id: string; name: string; email: string } | null;
  _count: { comments: number; events: number };
};

export type CaseDetail = CaseListItem & {
  acknowledgedByCurrentUser: boolean;
  comments: EntityComment[];
  student: CaseListItem["student"] & {
    institution: { id: string; name: string };
    course: { id: string; name: string } | null;
  };
};

export type CasesResponse = {
  data: CaseListItem[];
  meta: { total: number; page: number; pageSize: number; pageCount?: number };
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

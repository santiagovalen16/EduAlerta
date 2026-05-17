import type { LucideIcon } from "lucide-react";
import type { AuthUser, RoleKey } from "@/lib/auth/types";
import type { MonitoringOverview, TerritorialOverview } from "@/types/dashboard";

export type RoleWorkspaceKind = "admin" | "secretaria" | "rector" | "coordinator" | "teacher" | "guardian" | "student";

export type InstitutionDashboard = {
  metrics: {
    students: number;
    atRiskStudents: number;
    criticalStudents: number;
    activeAlerts: number;
    attendanceRate: number;
  };
  recentAlerts: Array<{
    id: string;
    description: string;
    status: string;
    priority: string;
    createdAt: string;
    student: { firstName: string; lastName: string };
  }>;
};

export type PublicStats = {
  students: number;
  activeAlerts: number;
  institutions: number;
  municipalities: number;
};

export type DashboardCopy = {
  role: RoleKey;
  title: string;
  description: string;
};

export type DashboardData = {
  user: AuthUser;
  institution: InstitutionDashboard | null;
  territorial: TerritorialOverview | null;
  monitoring: MonitoringOverview | null;
  publicStats: PublicStats | null;
};

export type DashboardMetric = [label: string, value: number | string, icon: LucideIcon];

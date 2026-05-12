import type { RiskLevel } from "@/features/dashboard/types";

export type StudentListItem = {
  id: string;
  firstName: string;
  lastName: string;
  documentNumber: string | null;
  grade: string;
  riskLevel: RiskLevel;
  institution: { name: string; municipality: { name: string } };
  course: { name: string } | null;
  _count: { alerts: number; attendance: number; incidents: number };
};

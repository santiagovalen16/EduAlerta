import type { AlertStatus, AlertType, RiskLevel } from "@/features/dashboard/types";

export type AlertListItem = {
  id: string;
  type: AlertType;
  status: AlertStatus;
  description: string;
  createdAt: string;
  student: {
    firstName: string;
    lastName: string;
    riskLevel: RiskLevel;
    course: { name: string } | null;
    institution: { name: string; municipality: { name: string } };
  };
  createdBy: { name: string; email: string };
};

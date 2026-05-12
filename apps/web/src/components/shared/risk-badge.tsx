import { Badge } from "@/components/ui/badge";
import type { AlertPriority, AlertStatus, RiskLevel } from "@/types/dashboard";

export function RiskBadge({ value }: { value: RiskLevel | AlertPriority }) {
  const variant = value === "CRITICAL" ? "danger" : value === "HIGH" ? "warning" : value === "MEDIUM" ? "default" : "success";
  return <Badge variant={variant}>{value}</Badge>;
}

export function AlertStatusBadge({ value }: { value: AlertStatus }) {
  const variant = value === "ESCALATED" ? "danger" : value === "IN_REVIEW" ? "warning" : value === "CLOSED" ? "muted" : "default";
  return <Badge variant={variant}>{value}</Badge>;
}

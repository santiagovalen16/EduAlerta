export type PendingAlert = {
  clientGeneratedId: string;
  studentId: string;
  type: "ATTENDANCE" | "ACADEMIC" | "BEHAVIOR" | "FAMILY";
  description: string;
  createdAt: string;
};

const STORAGE_KEY = "edualerta.pending-alerts";

export function getPendingAlerts(): PendingAlert[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  return raw ? (JSON.parse(raw) as PendingAlert[]) : [];
}

export function enqueueAlert(alert: PendingAlert) {
  const alerts = getPendingAlerts();
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...alerts, alert]));
}

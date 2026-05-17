export type IncidentsResponse = {
  data: Array<{ id: string; title: string; type: string; severity: string; status: string; occurredAt: string; student: { firstName: string; lastName: string }; reportedBy: { name: string } | null }>;
};

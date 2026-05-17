export type CasesResponse = {
  data: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    riskLevel: string;
    openedAt: string;
    student: { firstName: string; lastName: string; grade: string };
    assignedTo: { name: string } | null;
    _count: { comments: number; events: number };
  }>;
};

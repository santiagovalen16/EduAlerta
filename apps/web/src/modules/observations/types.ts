export type StudentsResponse = { data: Array<{ id: string; firstName: string; lastName: string }> };

export type ObservationsResponse = {
  data: Array<{
    id: string;
    title: string;
    category: string;
    severity: string;
    description: string;
    createdAt: string;
    student: { firstName: string; lastName: string };
    author: { name: string } | null;
  }>;
};

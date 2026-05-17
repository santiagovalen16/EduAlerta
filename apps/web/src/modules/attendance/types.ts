export type StudentsResponse = { data: Array<{ id: string; firstName: string; lastName: string; course: { id: string; name: string } | null }> };

export type AttendanceResponse = {
  data: Array<{ id: string; date: string; status: string; notes: string | null; student: { firstName: string; lastName: string }; course: { name: string } }>;
};

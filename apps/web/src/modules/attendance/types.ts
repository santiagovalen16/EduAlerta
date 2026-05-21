export type StudentsResponse = {
  data: Array<{
    id: string;
    firstName: string;
    lastName: string;
    course: { id: string; name: string } | null;
  }>;
};

export type AttendanceResponse = {
  data: Array<{
    id: string;
    date: string;
    status: "PRESENT" | "LATE" | "ABSENT" | "JUSTIFIED";
    notes: string | null;
    student: { id: string; firstName: string; lastName: string };
    course: { id: string; name: string };
  }>;
};

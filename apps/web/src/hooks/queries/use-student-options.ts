"use client";

import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/services/api/query-keys";
import { fetchStudentOptions } from "@/services/students/students.service";

export function useStudentOptions() {
  return useQuery({
    queryKey: queryKeys.students.options,
    queryFn: fetchStudentOptions
  });
}

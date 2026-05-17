"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { browserApiClient } from "@/lib/api/browser-client";
import { queryKeys } from "@/services/api/query-keys";

export type CreateAttendanceInput = {
  studentId: string;
  courseId: string;
  date: string;
  status: "PRESENT" | "LATE" | "ABSENT" | "JUSTIFIED";
  notes?: string;
};

export function useCreateAttendanceMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateAttendanceInput) => browserApiClient("/attendance", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
      void queryClient.invalidateQueries({ queryKey: ["monitoring"] });
    }
  });
}

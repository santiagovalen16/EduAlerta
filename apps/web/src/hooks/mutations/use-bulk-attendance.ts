"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { browserApiClient } from "@/lib/api/browser-client";
import { queryKeys } from "@/services/api/query-keys";

export type BulkAttendanceRecordInput = {
  studentId: string;
  courseId: string;
  date: string;
  status: "PRESENT" | "LATE" | "ABSENT" | "JUSTIFIED";
  notes?: string;
};

export function useBulkAttendanceMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (records: BulkAttendanceRecordInput[]) =>
      browserApiClient("/attendance/bulk", {
        method: "POST",
        body: JSON.stringify({ records })
      }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.attendance.all });
      void queryClient.invalidateQueries({ queryKey: ["monitoring"] });
    }
  });
}

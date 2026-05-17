"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { browserApiClient } from "@/lib/api/browser-client";
import { queryKeys } from "@/services/api/query-keys";

export type CreateObservationInput = {
  studentId: string;
  category: "BEHAVIOR" | "COEXISTENCE" | "ACADEMIC" | "COMMITMENT" | "POSITIVE" | "NEGATIVE";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  title: string;
  description: string;
  followUpRequired?: boolean;
  isPositive?: boolean;
};

export function useCreateObservationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateObservationInput) => browserApiClient("/observations", { method: "POST", body: JSON.stringify(payload) }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.observations.all });
      void queryClient.invalidateQueries({ queryKey: ["monitoring"] });
    }
  });
}

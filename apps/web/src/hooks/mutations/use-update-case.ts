"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateCase } from "@/services/cases/cases.service";

type UpdateCasePayload = Parameters<typeof updateCase>[1];

export function useUpdateCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload
    }: {
      id: string;
      payload: UpdateCasePayload;
    }) => updateCase(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cases"] });
      void queryClient.invalidateQueries({ queryKey: ["monitoring"] });
    }
  });
}

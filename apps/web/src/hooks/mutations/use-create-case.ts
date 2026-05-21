"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCase } from "@/services/cases/cases.service";

export function useCreateCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCase,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cases"] });
      void queryClient.invalidateQueries({ queryKey: ["monitoring"] });
    }
  });
}

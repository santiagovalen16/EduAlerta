"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteCase } from "@/services/cases/cases.service";

export function useDeleteCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCase,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["cases"] });
      void queryClient.invalidateQueries({ queryKey: ["monitoring"] });
    }
  });
}

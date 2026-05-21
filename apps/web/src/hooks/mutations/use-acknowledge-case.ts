"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acknowledgeCase } from "@/services/cases/case-comments.service";

export function useAcknowledgeCase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acknowledgeCase,
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: ["cases"] });
      void queryClient.invalidateQueries({ queryKey: ["cases", "detail", id] });
    }
  });
}

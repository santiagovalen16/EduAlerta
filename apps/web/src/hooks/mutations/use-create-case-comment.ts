"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createCaseComment } from "@/services/cases/case-comments.service";

export function useCreateCaseComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => createCaseComment(id, body),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["cases"] });
      void queryClient.invalidateQueries({ queryKey: ["cases", "detail", variables.id] });
    }
  });
}

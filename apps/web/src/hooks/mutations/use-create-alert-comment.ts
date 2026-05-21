"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAlertComment } from "@/services/alerts/alerts.service";

export function useCreateAlertComment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: string }) => createAlertComment(id, body),
    onSuccess: (_data, variables) => {
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
      void queryClient.invalidateQueries({ queryKey: ["alerts", "detail", variables.id] });
    }
  });
}

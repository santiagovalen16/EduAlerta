"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { acknowledgeAlert } from "@/services/alerts/alerts.service";

export function useAcknowledgeAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: acknowledgeAlert,
    onSuccess: (_data, id) => {
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
      void queryClient.invalidateQueries({ queryKey: ["alerts", "detail", id] });
    }
  });
}

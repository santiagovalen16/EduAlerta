"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAlert } from "@/services/alerts/alerts.service";

export function useCreateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAlert,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
      void queryClient.invalidateQueries({ queryKey: ["monitoring"] });
      void queryClient.invalidateQueries({ queryKey: ["territorial"] });
    }
  });
}

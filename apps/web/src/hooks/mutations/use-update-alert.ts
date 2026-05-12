"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateAlert } from "@/services/alerts/alerts.service";

export function useUpdateAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Record<string, unknown> }) => updateAlert(id, payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
      void queryClient.invalidateQueries({ queryKey: ["monitoring"] });
      void queryClient.invalidateQueries({ queryKey: ["territorial"] });
    }
  });
}

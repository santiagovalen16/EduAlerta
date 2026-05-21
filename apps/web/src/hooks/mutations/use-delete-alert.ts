"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAlert } from "@/services/alerts/alerts.service";

export function useDeleteAlert() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAlert,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["alerts"] });
      void queryClient.invalidateQueries({ queryKey: ["monitoring"] });
      void queryClient.invalidateQueries({ queryKey: ["territorial"] });
    }
  });
}

"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markNotificationRead } from "@/services/notifications/notifications.service";

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: markNotificationRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });
}

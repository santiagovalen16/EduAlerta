"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchNotifications } from "@/services/notifications/notifications.service";

export function useNotifications() {
  return useQuery({
    queryKey: ["notifications", "list"],
    queryFn: fetchNotifications
  });
}

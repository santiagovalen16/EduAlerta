"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchUnreadCount } from "@/services/notifications/notifications.service";

export function useUnreadNotificationsCount() {
  return useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: fetchUnreadCount,
    refetchInterval: 30000
  });
}

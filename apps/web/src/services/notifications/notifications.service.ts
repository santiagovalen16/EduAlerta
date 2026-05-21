import { apiClient } from "@/services/api/client";

export type NotificationItem = {
  id: string;
  title: string;
  body: string;
  alertId: string | null;
  status: "PENDING" | "SENT" | "READ" | "FAILED";
  readAt: string | null;
  createdAt: string;
};

export function fetchNotifications() {
  return apiClient<NotificationItem[]>("/notifications");
}

export function fetchUnreadCount() {
  return apiClient<{ count: number }>("/notifications/unread-count");
}

export function markNotificationRead(id: string) {
  return apiClient<NotificationItem>(`/notifications/${id}/read`, {
    method: "PATCH"
  });
}

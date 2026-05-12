import { apiClient } from "@/services/api/client";

export type UserProfile = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  avatarUrl: string | null;
  position: string | null;
  emailVerifiedAt?: string | null;
  onboardingCompletedAt?: string | null;
  preferences?: UserPreferences | null;
  institution: { id: string; name: string } | null;
  role: { key: string; name: string };
};

export type UserPreferences = {
  language?: "es" | "en";
  theme?: "system" | "light" | "dark";
  reducedMotion?: boolean;
  highContrast?: boolean;
  emailNotifications?: boolean;
  alertNotifications?: boolean;
  digestFrequency?: "daily" | "weekly" | "disabled";
};

export type UserSession = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
};

export type AuditLog = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
};

export function updateProfile(input: { name: string; phone?: string | null; position?: string | null; avatarUrl?: string | null }) {
  return apiClient<UserProfile>("/users/me", {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function updatePreferences(input: UserPreferences) {
  return apiClient<{ id: string; preferences: UserPreferences; onboardingCompletedAt: string | null }>("/users/me/preferences", {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function completeOnboarding(input: UserPreferences) {
  return apiClient<{ id: string; preferences: UserPreferences; onboardingCompletedAt: string }>("/users/me/onboarding", {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function changePassword(input: { currentPassword: string; newPassword: string }) {
  return apiClient<{ ok: true }>("/users/me/password", {
    method: "PATCH",
    body: JSON.stringify(input)
  });
}

export function revokeSession(id: string) {
  return apiClient<{ ok: true }>(`/users/me/sessions/${id}`, { method: "DELETE" });
}

export function fetchAuditLog() {
  return apiClient<AuditLog[]>("/audit-logs/me");
}

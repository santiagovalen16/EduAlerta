import { apiClient } from "@/services/api/client";

export type CurrentUser = {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  institution: { id: string; name: string } | null;
  emailVerifiedAt: string | null;
  onboardingCompletedAt: string | null;
};

export function fetchCurrentUser() {
  return apiClient<CurrentUser>("/auth/me");
}

export function fetchProfile() {
  return apiClient<CurrentUser>("/users/me");
}

export function fetchSessions() {
  return apiClient<Array<{ id: string; userAgent: string | null; ipAddress: string | null; createdAt: string; expiresAt: string; revokedAt: string | null }>>(
    "/users/me/sessions"
  );
}

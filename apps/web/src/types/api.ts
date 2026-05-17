import type { RoleKey } from "@/lib/auth/types";

export type Role = RoleKey;
export type Permission = string;

export type ApiResponse<T> = T;

export type PaginatedResponse<T> = {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    pageCount?: number;
  };
};

export type UserSession = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
  revokedAt: string | null;
};

import type { RoleKey } from "./types";

export const roleDashboardPath: Record<RoleKey, string> = {
  SUPER_ADMIN: "/dashboard/admin",
  SECRETARIA: "/dashboard/secretaria",
  RECTOR: "/dashboard/rector",
  COORDINADOR: "/dashboard/coordinator",
  DOCENTE: "/dashboard/teacher",
  ACUDIENTE: "/dashboard/guardian",
  ESTUDIANTE: "/dashboard/student"
};

export const dashboardRouteRoles: Record<string, RoleKey[]> = {
  "/dashboard/admin": ["SUPER_ADMIN"],
  "/dashboard/secretaria": ["SECRETARIA", "SUPER_ADMIN"],
  "/dashboard/rector": ["RECTOR", "SUPER_ADMIN"],
  "/dashboard/coordinator": ["COORDINADOR", "RECTOR", "SUPER_ADMIN"],
  "/dashboard/teacher": ["DOCENTE", "COORDINADOR", "RECTOR", "SUPER_ADMIN"],
  "/dashboard/guardian": ["ACUDIENTE", "SUPER_ADMIN"],
  "/dashboard/student": ["ESTUDIANTE", "SUPER_ADMIN"]
};

export function getRoleDashboard(role: string | undefined) {
  if (!role || !(role in roleDashboardPath)) return "/dashboard";
  return roleDashboardPath[role as RoleKey];
}

export function requiredRolesForPath(pathname: string) {
  const match = Object.entries(dashboardRouteRoles).find(([prefix]) => pathname === prefix || pathname.startsWith(`${prefix}/`));
  return match?.[1];
}

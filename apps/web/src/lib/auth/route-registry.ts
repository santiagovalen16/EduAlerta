import {
  AlertTriangle,
  Bell,
  BookOpen,
  Building2,
  ChartNoAxesCombined,
  ClipboardCheck,
  GraduationCap,
  History,
  LayoutDashboard,
  Map,
  Settings,
  ShieldCheck,
  Siren,
  User,
  Users,
  type LucideIcon
} from "lucide-react";
import type { Permission, Role } from "@/types/api";

export type AppRoute = {
  href: string;
  label: string;
  icon?: LucideIcon;
  roles?: Role[];
  permission?: Permission;
  sidebar?: boolean;
  quickAction?: boolean;
  authenticated?: boolean;
  breadcrumb?: string;
};

export const roleDashboardPath: Record<Role, string> = {
  SUPER_ADMIN: "/dashboard/admin",
  SECRETARIA: "/dashboard/secretaria",
  RECTOR: "/dashboard/rector",
  COORDINADOR: "/dashboard/coordinator",
  DOCENTE: "/dashboard/teacher",
  ACUDIENTE: "/dashboard/guardian",
  ESTUDIANTE: "/dashboard/student"
};

export const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email", "/activate-account"] as const;

export const protectedRoutePrefixes = ["/dashboard", "/profile", "/settings", "/account", "/onboarding"] as const;

export const routeRegistry: AppRoute[] = [
  { href: "/dashboard/admin", label: "Administracion", icon: ShieldCheck, roles: ["SUPER_ADMIN"], sidebar: true, authenticated: true },
  { href: "/dashboard/secretaria", label: "Territorio", icon: Map, roles: ["SECRETARIA", "SUPER_ADMIN"], sidebar: true, authenticated: true },
  { href: "/dashboard/rector", label: "Rectoria", icon: Building2, roles: ["RECTOR", "SUPER_ADMIN"], sidebar: true, authenticated: true },
  { href: "/dashboard/coordinator", label: "Coordinacion", icon: ChartNoAxesCombined, roles: ["COORDINADOR", "RECTOR", "SUPER_ADMIN"], sidebar: true, authenticated: true },
  { href: "/dashboard/teacher", label: "Docencia", icon: BookOpen, roles: ["DOCENTE", "COORDINADOR", "RECTOR", "SUPER_ADMIN"], sidebar: true, authenticated: true },
  { href: "/dashboard/guardian", label: "Mis hijos", icon: Users, roles: ["ACUDIENTE", "SUPER_ADMIN"], sidebar: true, authenticated: true },
  { href: "/dashboard/student", label: "Mi rendimiento", icon: GraduationCap, roles: ["ESTUDIANTE", "SUPER_ADMIN"], sidebar: true, authenticated: true },
  { href: "/dashboard/alerts", label: "Alertas", icon: Siren, permission: "alert:read", sidebar: true, quickAction: true, authenticated: true },
  { href: "/dashboard/attendance", label: "Asistencia", icon: ClipboardCheck, permission: "attendance:read", sidebar: true, authenticated: true },
  { href: "/dashboard/observations", label: "Observador", icon: BookOpen, permission: "observation:read", sidebar: true, authenticated: true },
  { href: "/dashboard/incidents", label: "Convivencia", icon: AlertTriangle, permission: "incident:read", sidebar: true, authenticated: true },
  { href: "/dashboard/territorial", label: "Analitica territorial", icon: Map, permission: "dashboard:territory:read", sidebar: true, authenticated: true },
  { href: "/dashboard/activity", label: "Actividad", icon: History, sidebar: true, authenticated: true },
  { href: "/dashboard/reports", label: "Reportes", icon: ChartNoAxesCombined, permission: "report:export", sidebar: true, authenticated: true },
  { href: "/profile", label: "Perfil", icon: User, sidebar: true, authenticated: true },
  { href: "/settings", label: "Configuracion", icon: Settings, sidebar: true, authenticated: true },
  { href: "/settings/notifications", label: "Configurar notificaciones", icon: Bell, quickAction: true, authenticated: true },
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, authenticated: true },
  { href: "/account", label: "Cuenta", icon: User, authenticated: true },
  { href: "/onboarding", label: "Onboarding", authenticated: true },
  { href: "/login", label: "Iniciar sesion" },
  { href: "/register", label: "Registro" },
  { href: "/forgot-password", label: "Recuperar contrasena" },
  { href: "/reset-password", label: "Restablecer contrasena" },
  { href: "/verify-email", label: "Verificar correo" },
  { href: "/activate-account", label: "Activar cuenta" }
];

export const quickActionOverrides: Record<string, string> = {
  "/dashboard/alerts": "Crear o revisar alerta"
};

export function getRoleDashboard(role: string | undefined) {
  if (!role || !(role in roleDashboardPath)) return "/dashboard";
  return roleDashboardPath[role as Role];
}

export function matchRoute(pathname: string) {
  return routeRegistry.find((route) => pathname === route.href || pathname.startsWith(`${route.href}/`));
}

export function requiredRolesForPath(pathname: string) {
  return matchRoute(pathname)?.roles;
}

export function requiredPermissionForPath(pathname: string) {
  return matchRoute(pathname)?.permission;
}

export function isAuthRoute(pathname: string) {
  return authRoutes.some((route) => pathname.startsWith(route));
}

export function isProtectedRoute(pathname: string) {
  return protectedRoutePrefixes.some((route) => pathname.startsWith(route));
}

export function canAccessRoute(route: AppRoute, role: Role, permissions: Permission[]) {
  const roleAllowed = !route.roles || route.roles.includes(role);
  const permissionAllowed = !route.permission || permissions.includes(route.permission);
  return roleAllowed && permissionAllowed;
}

export function getSidebarRoutes(role: Role, permissions: Permission[]) {
  return routeRegistry.filter((route) => route.sidebar && canAccessRoute(route, role, permissions));
}

export function getQuickActionRoutes(role: Role, permissions: Permission[]) {
  return routeRegistry
    .filter((route) => route.quickAction && canAccessRoute(route, role, permissions))
    .map((route) => ({ ...route, label: quickActionOverrides[route.href] ?? route.label }));
}

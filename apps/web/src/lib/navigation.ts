import {
  Bell,
  AlertTriangle,
  BookOpen,
  Building2,
  ChartNoAxesCombined,
  ClipboardCheck,
  ClipboardList,
  GraduationCap,
  History,
  LayoutDashboard,
  Map,
  Search,
  Settings,
  ShieldCheck,
  Siren,
  User,
  Users
} from "lucide-react";
import type { RoleKey } from "@/lib/auth/types";

export type NavigationItem = {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  permission?: string;
  roles?: RoleKey[];
};

export const navigationItems: NavigationItem[] = [
  { href: "/dashboard/admin", label: "Administracion", icon: ShieldCheck, roles: ["SUPER_ADMIN"] },
  { href: "/dashboard/secretaria", label: "Territorio", icon: Map, roles: ["SECRETARIA", "SUPER_ADMIN"] },
  { href: "/dashboard/rector", label: "Rectoria", icon: Building2, roles: ["RECTOR", "SUPER_ADMIN"] },
  { href: "/dashboard/coordinator", label: "Coordinacion", icon: ChartNoAxesCombined, roles: ["COORDINADOR", "RECTOR", "SUPER_ADMIN"] },
  { href: "/dashboard/teacher", label: "Docencia", icon: BookOpen, roles: ["DOCENTE", "COORDINADOR", "RECTOR", "SUPER_ADMIN"] },
  { href: "/dashboard/guardian", label: "Mis hijos", icon: Users, roles: ["ACUDIENTE", "SUPER_ADMIN"] },
  { href: "/dashboard/student", label: "Mi rendimiento", icon: GraduationCap, roles: ["ESTUDIANTE", "SUPER_ADMIN"] },
  { href: "/dashboard/alerts", label: "Alertas", icon: Siren, permission: "alert:read" },
  { href: "/dashboard/cases", label: "Casos", icon: ClipboardList, permission: "case:read" },
  { href: "/dashboard/attendance", label: "Asistencia", icon: ClipboardCheck, permission: "attendance:read" },
  { href: "/dashboard/observations", label: "Observador", icon: BookOpen, permission: "observation:read" },
  { href: "/dashboard/incidents", label: "Convivencia", icon: AlertTriangle, permission: "incident:read" },
  { href: "/dashboard/monitoring", label: "Seguimiento", icon: Users, permission: "student:read" },
  { href: "/dashboard/territorial", label: "Analitica territorial", icon: Map, permission: "dashboard:territory:read" },
  { href: "/dashboard/activity", label: "Actividad", icon: History },
  { href: "/dashboard/reports", label: "Reportes", icon: ChartNoAxesCombined, permission: "report:export" },
  { href: "/profile", label: "Perfil", icon: User },
  { href: "/settings", label: "Configuracion", icon: Settings }
];

export const quickActions: NavigationItem[] = [
  { href: "/dashboard/alerts", label: "Crear o revisar alerta", icon: Siren, permission: "alert:read" },
  { href: "/dashboard/monitoring", label: "Buscar estudiante", icon: Search, permission: "student:read" },
  { href: "/settings/notifications", label: "Configurar notificaciones", icon: Bell }
];

export function visibleNavigation(role: RoleKey, permissions: string[]) {
  return navigationItems.filter((item) => {
    const roleAllowed = !item.roles || item.roles.includes(role);
    const permissionAllowed = !item.permission || permissions.includes(item.permission);
    return roleAllowed && permissionAllowed;
  });
}

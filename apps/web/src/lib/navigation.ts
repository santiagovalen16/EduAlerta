import { Search } from "lucide-react";
import {
  getQuickActionRoutes,
  getSidebarRoutes,
  routeRegistry,
  type AppRoute
} from "@/lib/auth/route-registry";
import type { RoleKey } from "@/lib/auth/types";

export type NavigationItem = AppRoute & {
  icon: NonNullable<AppRoute["icon"]>;
};

function hasIcon(route: AppRoute): route is NavigationItem {
  return Boolean(route.icon);
}

export const navigationItems: NavigationItem[] = routeRegistry.filter((route) => route.sidebar).filter(hasIcon);

export const quickActions: NavigationItem[] = routeRegistry
  .filter((route) => route.quickAction)
  .filter(hasIcon)
  .map((route) => (route.href === "/dashboard/monitoring" ? { ...route, icon: Search } : route));

export function visibleNavigation(role: RoleKey, permissions: string[]) {
  return getSidebarRoutes(role, permissions).filter(hasIcon);
}

export function visibleQuickActions(role: RoleKey, permissions: string[]) {
  return getQuickActionRoutes(role, permissions).filter(hasIcon);
}

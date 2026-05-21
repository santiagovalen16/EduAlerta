"use client";

import { Bell, ChevronsUpDown, Command, GraduationCap, LogOut, Menu, Search, X } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { useUnreadNotificationsCount } from "@/hooks/queries/use-unread-notifications-count";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { AuthUser } from "@/lib/auth/types";
import { cn } from "@/lib/utils";
import { visibleNavigation, visibleQuickActions } from "@/lib/navigation";

export function DashboardShellClient({ user, children }: { user: AuthUser; children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const unreadQuery = useUnreadNotificationsCount();
  const navigation = useMemo(() => visibleNavigation(user.role, user.permissions), [user.role, user.permissions]);
  const actions = useMemo(() => visibleQuickActions(user.role, user.permissions), [user.role, user.permissions]);
  const activeItem = navigation.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`));

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    toast.success("Sesion cerrada");
    router.replace("/login");
    router.refresh();
  }

  const sidebar = (
    <aside className="flex h-full flex-col bg-card">
      <div className="flex h-16 items-center gap-3 border-b px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GraduationCap className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">EduAlerta</p>
          <p className="truncate text-xs text-muted-foreground">{user.institution?.name ?? "Plataforma SaaS"}</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Principal">
        {navigation.map((item) => {
          const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href as Route}
              onClick={() => setSidebarOpen(false)}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="border-t p-3">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-secondary" onClick={() => router.push("/profile")}>
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-secondary font-semibold">{user.name.slice(0, 1).toUpperCase()}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate font-medium">{user.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{user.role}</span>
          </span>
          <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
        </button>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-y-0 left-0 z-40 hidden w-72 border-r lg:block">{sidebar}</div>
      {sidebarOpen ? (
        <div className="fixed inset-0 z-50 bg-foreground/20 lg:hidden" role="dialog" aria-modal="true">
          <div className="h-full w-80 max-w-[86vw] border-r bg-card shadow-xl">
            <div className="absolute left-[calc(min(86vw,20rem)-3rem)] top-3">
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} aria-label="Cerrar menu">
                <X className="h-4 w-4" />
              </Button>
            </div>
            {sidebar}
          </div>
        </div>
      ) : null}
      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/90 px-4 backdrop-blur lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setSidebarOpen(true)} aria-label="Abrir menu">
              <Menu className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Link href="/dashboard">Inicio</Link>
                <span>/</span>
                <span className="truncate">{activeItem?.label ?? "Panel"}</span>
              </div>
              <h1 className="truncate text-sm font-semibold">{activeItem?.label ?? "Panel de trabajo"}</h1>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" className="hidden min-w-56 justify-start text-muted-foreground md:inline-flex" onClick={() => setCommandOpen(true)}>
              <Command className="h-4 w-4" />
              Buscar o ejecutar accion
            </Button>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notificaciones" onClick={() => router.push("/settings/notifications" as Route)}>
              <Bell className="h-4 w-4" />
              {(unreadQuery.data?.count ?? 0) > 0 ? (
                <span className="absolute right-1 top-1 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold text-white">
                  {unreadQuery.data && unreadQuery.data.count > 9 ? "9+" : unreadQuery.data?.count}
                </span>
              ) : null}
            </Button>
            <Badge variant="muted" className="hidden sm:inline-flex">
              {user.role}
            </Badge>
            <Button variant="ghost" size="icon" onClick={logout} aria-label="Cerrar sesion">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </header>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
      {commandOpen ? (
        <div className="fixed inset-0 z-50 grid place-items-start bg-foreground/20 px-4 pt-24" role="dialog" aria-modal="true">
          <div className="w-full max-w-xl rounded-lg border bg-card p-2 shadow-xl">
            <div className="flex items-center gap-2 border-b px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Acciones rapidas disponibles segun tus permisos</span>
              <Button variant="ghost" size="icon" className="ml-auto" onClick={() => setCommandOpen(false)} aria-label="Cerrar comandos">
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-2">
              {actions.map((item) => (
                <button
                  key={item.href}
                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-secondary"
                  onClick={() => {
                    setCommandOpen(false);
                    router.push(item.href as Route);
                  }}
                >
                  <item.icon className="h-4 w-4 text-muted-foreground" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

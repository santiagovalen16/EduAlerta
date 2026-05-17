import { Siren, Users } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/lib/auth/types";
import type { DashboardCopy } from "../types";

export function DashboardHeader({ copy, user }: { copy: DashboardCopy; user: AuthUser }) {
  return (
    <header className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="default">{copy.role}</Badge>
          <span className="text-sm text-muted-foreground">{user.institution?.name ?? "EduAlerta"}</span>
        </div>
        <h1 className="mt-3 text-2xl font-semibold tracking-normal">{copy.title}</h1>
        <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{copy.description}</p>
      </div>
      <QuickActions permissions={user.permissions} />
    </header>
  );
}

function QuickActions({ permissions }: { permissions: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {permissions.includes("alert:read") ? (
        <Button asChild>
          <Link href={"/dashboard/alerts" as Route}>
            <Siren className="h-4 w-4" />
            Alertas
          </Link>
        </Button>
      ) : null}
      {permissions.includes("student:read") ? (
        <Button variant="outline" asChild>
          <Link href={"/dashboard/monitoring" as Route}>
            <Users className="h-4 w-4" />
            Seguimiento
          </Link>
        </Button>
      ) : null}
    </div>
  );
}

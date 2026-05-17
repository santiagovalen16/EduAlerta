import type { ReactNode } from "react";
import { AdminDashboardView } from "../views/AdminDashboardView";
import { CoordinatorDashboardView } from "../views/CoordinatorDashboardView";
import { GuardianDashboardView } from "../views/GuardianDashboardView";
import { RectorDashboardView } from "../views/RectorDashboardView";
import { SecretariaDashboardView } from "../views/SecretariaDashboardView";
import { StudentDashboardView } from "../views/StudentDashboardView";
import { TeacherDashboardView } from "../views/TeacherDashboardView";
import type { DashboardData, RoleWorkspaceKind } from "../types";

type DashboardStrategy = {
  View: (props: DashboardData) => ReactNode;
};

export const dashboardStrategies: Record<RoleWorkspaceKind, DashboardStrategy> = {
  admin: { View: AdminDashboardView },
  secretaria: { View: SecretariaDashboardView },
  rector: { View: RectorDashboardView },
  coordinator: { View: CoordinatorDashboardView },
  teacher: { View: TeacherDashboardView },
  guardian: { View: GuardianDashboardView },
  student: { View: StudentDashboardView }
};

import { RoleWorkspace } from "./RoleWorkspace";

export function AdminDashboard() {
  return <RoleWorkspace kind="admin" />;
}

export function SecretariaDashboard() {
  return <RoleWorkspace kind="secretaria" />;
}

export function RectorDashboard() {
  return <RoleWorkspace kind="rector" />;
}

export function CoordinatorDashboard() {
  return <RoleWorkspace kind="coordinator" />;
}

export function TeacherDashboard() {
  return <RoleWorkspace kind="teacher" />;
}

export function GuardianDashboard() {
  return <RoleWorkspace kind="guardian" />;
}

export function StudentDashboard() {
  return <RoleWorkspace kind="student" />;
}

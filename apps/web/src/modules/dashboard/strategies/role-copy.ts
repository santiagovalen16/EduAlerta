import type { DashboardCopy, RoleWorkspaceKind } from "../types";

export const roleCopy: Record<RoleWorkspaceKind, DashboardCopy> = {
  admin: {
    role: "SUPER_ADMIN",
    title: "Administracion global",
    description: "Gobierno de plataforma, instituciones, roles, permisos y salud operacional."
  },
  secretaria: {
    role: "SECRETARIA",
    title: "Secretaria de Educacion",
    description: "Lectura territorial de municipios, instituciones conectadas y concentracion de alertas."
  },
  rector: {
    role: "RECTOR",
    title: "Rectoria institucional",
    description: "Estado de riesgo, permanencia y seguimiento dentro de la institucion."
  },
  coordinator: {
    role: "COORDINADOR",
    title: "Coordinacion de seguimiento",
    description: "Priorizacion de casos, alertas escaladas y acompanamiento institucional."
  },
  teacher: {
    role: "DOCENTE",
    title: "Panel docente",
    description: "Trabajo diario con estudiantes, alertas academicas y seguimiento de aula."
  },
  guardian: {
    role: "ACUDIENTE",
    title: "Panel de acudiente",
    description: "Seguimiento de hijos, alertas abiertas y acciones de acompanamiento familiar."
  },
  student: {
    role: "ESTUDIANTE",
    title: "Mi trayectoria academica",
    description: "Resumen personal de rendimiento, asistencia, observaciones y alertas."
  }
};

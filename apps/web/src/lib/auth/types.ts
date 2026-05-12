export type RoleKey =
  | "SUPER_ADMIN"
  | "SECRETARIA"
  | "RECTOR"
  | "COORDINADOR"
  | "DOCENTE"
  | "ACUDIENTE"
  | "ESTUDIANTE";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: RoleKey;
  permissions: string[];
  institution: { id: string; name: string } | null;
  emailVerifiedAt: string | null;
  onboardingCompletedAt: string | null;
};

export type AuthResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

import { ForbiddenException } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import { CurrentUserPayload } from "../decorators/current-user.decorator";

export function getInstitutionScope(user: CurrentUserPayload) {
  if (user.role === RoleKey.SUPER_ADMIN || user.role === RoleKey.SECRETARIA) return undefined;
  if (!user.institutionId) throw new ForbiddenException("User is not assigned to an institution.");
  return user.institutionId;
}

export function assertInstitutionAccess(user: CurrentUserPayload, institutionId: string) {
  if (user.role === RoleKey.ACUDIENTE) return;
  const scope = getInstitutionScope(user);
  if (scope && scope !== institutionId) throw new ForbiddenException("Institution access denied.");
}

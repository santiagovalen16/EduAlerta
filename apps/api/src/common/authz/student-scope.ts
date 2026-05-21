import { ForbiddenException } from "@nestjs/common";
import { Prisma, RoleKey } from "@prisma/client";
import { CurrentUserPayload } from "../decorators/current-user.decorator";
import { getInstitutionScope } from "./tenant-scope";

export function getStudentVisibilityWhere(user: CurrentUserPayload): Prisma.StudentWhereInput {
  if (user.role === RoleKey.ACUDIENTE) {
    return {
      guardians: {
        some: {
          deletedAt: null,
          guardian: {
            deletedAt: null,
            userId: user.sub
          }
        }
      }
    };
  }

  if (user.role === RoleKey.DOCENTE) {
    return {
      course: {
        OR: [
          {
            teacherAssignments: {
              some: {
                deletedAt: null,
                teacher: {
                  deletedAt: null,
                  userId: user.sub
                }
              }
            }
          },
          {
            teacher: {
              deletedAt: null,
              userId: user.sub
            }
          }
        ]
      }
    };
  }

  const institutionId = getInstitutionScope(user);
  return institutionId ? { institutionId } : {};
}

export function assertStudentVisibility(user: CurrentUserPayload, student: { institutionId: string; guardians?: Array<{ guardian: { userId: string } }> }) {
  if (user.role === RoleKey.ACUDIENTE) {
    const ownsStudent = student.guardians?.some((relation) => relation.guardian.userId === user.sub);
    if (!ownsStudent) throw new ForbiddenException("Student access denied.");
    return;
  }

  const institutionId = getInstitutionScope(user);
  if (institutionId && institutionId !== student.institutionId) throw new ForbiddenException("Student access denied.");
}

import { ForbiddenException } from "@nestjs/common";
import { Prisma, RoleKey } from "@prisma/client";
import { CurrentUserPayload } from "../decorators/current-user.decorator";
import { getInstitutionScope } from "./tenant-scope";

export function getCourseVisibilityWhere(user: CurrentUserPayload): Prisma.CourseWhereInput {
  if (user.role === RoleKey.DOCENTE) {
    return {
      teacherAssignments: {
        some: {
          deletedAt: null,
          teacher: {
            deletedAt: null,
            userId: user.sub
          }
        }
      }
    };
  }

  if (user.role === RoleKey.ACUDIENTE) {
    return {
      students: {
        some: {
          deletedAt: null,
          guardians: {
            some: {
              deletedAt: null,
              guardian: { deletedAt: null, userId: user.sub }
            }
          }
        }
      }
    };
  }

  const institutionId = getInstitutionScope(user);
  return institutionId ? { institutionId } : {};
}

export function assertCourseVisibility(user: CurrentUserPayload, course: { institutionId: string; teacherAssignments?: Array<{ teacher: { userId: string } }> }) {
  if (user.role === RoleKey.DOCENTE) {
    const ownsCourse = course.teacherAssignments?.some((assignment) => assignment.teacher.userId === user.sub);
    if (!ownsCourse) throw new ForbiddenException("Course access denied.");
    return;
  }

  const institutionId = getInstitutionScope(user);
  if (institutionId && institutionId !== course.institutionId) throw new ForbiddenException("Course access denied.");
}

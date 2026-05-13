import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { Prisma, RoleKey } from "@prisma/client";
import { getCourseVisibilityWhere } from "../../common/authz/course-scope";
import { getInstitutionScope } from "../../common/authz/tenant-scope";
import { CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../database/prisma.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { CreateSubjectDto } from "./dto/create-subject.dto";
import { CreateTeacherAssignmentDto } from "./dto/create-teacher-assignment.dto";
import { QueryAcademicDto } from "./dto/query-academic.dto";

@Injectable()
export class AcademicService {
  constructor(private readonly prisma: PrismaService) {}

  async subjects(query: QueryAcademicDto, user: CurrentUserPayload) {
    const institutionId = this.resolveReadInstitution(query.institutionId, user);
    const where: Prisma.SubjectWhereInput = {
      deletedAt: null,
      institutionId,
      ...(query.search ? { OR: [{ name: { contains: query.search, mode: "insensitive" } }, { code: { contains: query.search, mode: "insensitive" } }] } : {})
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.subject.count({ where }),
      this.prisma.subject.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      })
    ]);
    return { data, meta: { total, page: query.page, pageSize: query.pageSize, pageCount: Math.ceil(total / query.pageSize) } };
  }

  async createSubject(dto: CreateSubjectDto, user: CurrentUserPayload) {
    const institutionId = this.resolveWriteInstitution(dto.institutionId, user);
    return this.prisma.subject.upsert({
      where: { institutionId_name: { institutionId, name: dto.name } },
      update: { code: dto.code, description: dto.description, isActive: true, deletedAt: null },
      create: { institutionId, name: dto.name, code: dto.code, description: dto.description }
    });
  }

  async courses(query: QueryAcademicDto, user: CurrentUserPayload) {
    const institutionId = this.resolveReadInstitution(query.institutionId, user);
    const where: Prisma.CourseWhereInput = {
      deletedAt: null,
      ...getCourseVisibilityWhere(user),
      ...(institutionId ? { institutionId } : {}),
      ...(query.search ? { OR: [{ name: { contains: query.search, mode: "insensitive" } }, { grade: { contains: query.search, mode: "insensitive" } }] } : {})
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.course.count({ where }),
      this.prisma.course.findMany({
        where,
        include: {
          gradeModel: true,
          courseSubjects: { where: { deletedAt: null }, include: { subject: true } },
          teacherAssignments: { where: { deletedAt: null }, include: { teacher: { include: { user: { select: { id: true, name: true, email: true } } } }, subject: true } },
          _count: { select: { students: true } }
        },
        orderBy: [{ academicYear: "desc" }, { name: "asc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      })
    ]);
    return { data, meta: { total, page: query.page, pageSize: query.pageSize, pageCount: Math.ceil(total / query.pageSize) } };
  }

  async createCourse(dto: CreateCourseDto, user: CurrentUserPayload) {
    const institutionId = this.resolveWriteInstitution(dto.institutionId, user);
    return this.prisma.course.upsert({
      where: { institutionId_name_academicYear: { institutionId, name: dto.name, academicYear: dto.academicYear } },
      update: { grade: dto.grade, gradeId: dto.gradeId, deletedAt: null },
      create: { institutionId, name: dto.name, grade: dto.grade, academicYear: dto.academicYear, gradeId: dto.gradeId }
    });
  }

  async assignments(query: QueryAcademicDto, user: CurrentUserPayload) {
    const institutionId = this.resolveReadInstitution(query.institutionId, user);
    const where: Prisma.TeacherAssignmentWhereInput = {
      deletedAt: null,
      institutionId,
      ...(user.role === RoleKey.DOCENTE ? { teacher: { userId: user.sub } } : {})
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.teacherAssignment.count({ where }),
      this.prisma.teacherAssignment.findMany({
        where,
        include: { teacher: { include: { user: { select: { id: true, name: true, email: true } } } }, course: true, subject: true },
        orderBy: { createdAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      })
    ]);
    return { data, meta: { total, page: query.page, pageSize: query.pageSize, pageCount: Math.ceil(total / query.pageSize) } };
  }

  async createAssignment(dto: CreateTeacherAssignmentDto, user: CurrentUserPayload) {
    const [teacher, course, subject] = await Promise.all([
      this.prisma.teacher.findFirst({ where: { id: dto.teacherId, deletedAt: null } }),
      this.prisma.course.findFirst({ where: { id: dto.courseId, deletedAt: null } }),
      this.prisma.subject.findFirst({ where: { id: dto.subjectId, deletedAt: null } })
    ]);
    if (!teacher || !course || !subject) throw new NotFoundException("Teacher, course or subject not found.");
    const institutionId = this.resolveWriteInstitution(course.institutionId, user);
    if (teacher.institutionId !== institutionId || subject.institutionId !== institutionId) {
      throw new ForbiddenException("Academic assignment must stay inside the same institution.");
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.teacherSubject.upsert({
        where: { teacherId_subjectId: { teacherId: teacher.id, subjectId: subject.id } },
        update: { deletedAt: null },
        create: { teacherId: teacher.id, subjectId: subject.id }
      });
      await tx.teacherCourse.upsert({
        where: { teacherId_courseId: { teacherId: teacher.id, courseId: course.id } },
        update: { deletedAt: null },
        create: { teacherId: teacher.id, courseId: course.id }
      });
      await tx.courseSubject.upsert({
        where: { courseId_subjectId: { courseId: course.id, subjectId: subject.id } },
        update: { deletedAt: null },
        create: { courseId: course.id, subjectId: subject.id }
      });
      return tx.teacherAssignment.upsert({
        where: { teacherId_courseId_subjectId: { teacherId: teacher.id, courseId: course.id, subjectId: subject.id } },
        update: { institutionId, deletedAt: null },
        create: { institutionId, teacherId: teacher.id, courseId: course.id, subjectId: subject.id }
      });
    });
  }

  private resolveReadInstitution(institutionId: string | undefined, user: CurrentUserPayload) {
    const scopedInstitution = getInstitutionScope(user);
    if (scopedInstitution && institutionId && institutionId !== scopedInstitution) throw new ForbiddenException("Institution access denied.");
    return scopedInstitution ?? institutionId;
  }

  private resolveWriteInstitution(institutionId: string | undefined, user: CurrentUserPayload) {
    const scopedInstitution = getInstitutionScope(user);
    const resolved = scopedInstitution ?? institutionId;
    if (!resolved) throw new ForbiddenException("Institution is required for this action.");
    if (scopedInstitution && resolved !== scopedInstitution) throw new ForbiddenException("Institution access denied.");
    return resolved;
  }
}

import { Injectable, NotFoundException } from "@nestjs/common";
import { AuditAction, Prisma, RoleKey } from "@prisma/client";
import { assertInstitutionAccess, getInstitutionScope } from "../../common/authz/tenant-scope";
import { getStudentVisibilityWhere } from "../../common/authz/student-scope";
import { CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../database/prisma.service";
import { CreateIncidentDto } from "./dto/create-incident.dto";
import { QueryIncidentsDto } from "./dto/query-incidents.dto";

@Injectable()
export class IncidentsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: QueryIncidentsDto, user: CurrentUserPayload) {
    const institutionId = user.role === RoleKey.ACUDIENTE ? undefined : getInstitutionScope(user);
    const where: Prisma.IncidentWhereInput = {
      deletedAt: null,
      institutionId,
      student: getStudentVisibilityWhere(user),
      studentId: query.studentId,
      type: query.type,
      status: query.status,
      severity: query.severity,
      OR: query.search
        ? [{ title: { contains: query.search, mode: "insensitive" } }, { description: { contains: query.search, mode: "insensitive" } }]
        : undefined
    };
    const [total, data] = await this.prisma.$transaction([
      this.prisma.incident.count({ where }),
      this.prisma.incident.findMany({
        where,
        include: { student: { select: { id: true, firstName: true, lastName: true } }, reportedBy: { select: { id: true, name: true } } },
        orderBy: { occurredAt: "desc" },
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      })
    ]);
    return { data, meta: { total, page: query.page, pageSize: query.pageSize, pageCount: Math.ceil(total / query.pageSize) } };
  }

  async create(dto: CreateIncidentDto, user: CurrentUserPayload) {
    const student = await this.prisma.student.findFirst({ where: { id: dto.studentId, deletedAt: null, ...getStudentVisibilityWhere(user) } });
    if (!student) throw new NotFoundException("Student not found.");
    assertInstitutionAccess(user, student.institutionId);
    const teacher = await this.prisma.teacher.findFirst({ where: { userId: user.sub, deletedAt: null } });
    const created = await this.prisma.incident.create({
      data: {
        ...dto,
        occurredAt: new Date(dto.occurredAt),
        institutionId: student.institutionId,
        reportedById: user.sub,
        teacherId: teacher?.id
      }
    });
    await this.prisma.auditLog.create({
      data: { actorId: user.sub, action: AuditAction.INCIDENT_CREATED, entityType: "Incident", entityId: created.id, after: created }
    });
    return created;
  }
}

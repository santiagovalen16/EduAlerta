import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { AuditAction, CaseEventType, MonitoringCaseStatus, Prisma } from "@prisma/client";
import { assertInstitutionAccess, getInstitutionScope } from "../../common/authz/tenant-scope";
import { CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../database/prisma.service";
import { CreateCaseCommentDto } from "./dto/create-case-comment.dto";
import { CreateCaseDto } from "./dto/create-case.dto";
import { QueryCasesDto } from "./dto/query-cases.dto";
import { UpdateCaseDto } from "./dto/update-case.dto";

@Injectable()
export class CasesService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: QueryCasesDto, user: CurrentUserPayload) {
    const institutionId = getInstitutionScope(user);
    const where: Prisma.MonitoringCaseWhereInput = {
      deletedAt: null,
      institutionId,
      studentId: query.studentId,
      status: query.status,
      priority: query.priority,
      riskLevel: query.riskLevel,
      OR: query.search
        ? [
            { title: { contains: query.search, mode: "insensitive" } },
            { summary: { contains: query.search, mode: "insensitive" } },
            { student: { firstName: { contains: query.search, mode: "insensitive" } } },
            { student: { lastName: { contains: query.search, mode: "insensitive" } } }
          ]
        : undefined
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.monitoringCase.count({ where }),
      this.prisma.monitoringCase.findMany({
        where,
        include: {
          student: { select: { id: true, firstName: true, lastName: true, riskLevel: true, grade: true } },
          assignedTo: { select: { id: true, name: true, email: true } },
          openedBy: { select: { id: true, name: true, email: true } },
          _count: { select: { comments: true, events: true } }
        },
        orderBy: [{ priority: "desc" }, { openedAt: "desc" }],
        skip: (query.page - 1) * query.pageSize,
        take: query.pageSize
      })
    ]);

    return { data, meta: { total, page: query.page, pageSize: query.pageSize, pageCount: Math.ceil(total / query.pageSize) } };
  }

  async findById(id: string, user: CurrentUserPayload) {
    const record = await this.prisma.monitoringCase.findFirst({
      where: { id, deletedAt: null },
      include: {
        student: { include: { institution: { select: { id: true, name: true } }, course: true } },
        assignedTo: { select: { id: true, name: true, email: true } },
        openedBy: { select: { id: true, name: true, email: true } },
        comments: { where: { deletedAt: null }, include: { author: { select: { id: true, name: true } } }, orderBy: { createdAt: "desc" } }
      }
    });
    if (!record) throw new NotFoundException("Monitoring case not found.");
    assertInstitutionAccess(user, record.institutionId);
    return record;
  }

  async create(dto: CreateCaseDto, user: CurrentUserPayload) {
    const student = await this.prisma.student.findFirst({ where: { id: dto.studentId, deletedAt: null } });
    if (!student) throw new NotFoundException("Student not found.");
    assertInstitutionAccess(user, student.institutionId);

    return this.prisma.$transaction(async (tx) => {
      const created = await tx.monitoringCase.create({
        data: {
          studentId: dto.studentId,
          institutionId: student.institutionId,
          openedById: user.sub,
          assignedToId: dto.assignedToId,
          riskLevel: dto.riskLevel,
          priority: dto.priority,
          title: dto.title,
          summary: dto.summary,
          followUpAt: dto.followUpAt ? new Date(dto.followUpAt) : undefined
        }
      });
      await tx.monitoringCaseEvent.create({
        data: { caseId: created.id, actorId: user.sub, type: CaseEventType.CREATED, toStatus: created.status, body: "Caso creado" }
      });
      await tx.auditLog.create({
        data: { actorId: user.sub, action: AuditAction.CASE_CREATED, entityType: "MonitoringCase", entityId: created.id, after: created }
      });
      return created;
    });
  }

  async update(id: string, dto: UpdateCaseDto, user: CurrentUserPayload) {
    const current = await this.findById(id, user);
    if (dto.assignedToId) {
      const assignee = await this.prisma.user.findFirst({ where: { id: dto.assignedToId, deletedAt: null } });
      if (!assignee) throw new ForbiddenException("Assigned user not found.");
      assertInstitutionAccess(user, assignee.institutionId ?? current.institutionId);
    }

    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.monitoringCase.update({
        where: { id },
        data: {
          assignedToId: dto.assignedToId,
          status: dto.status,
          priority: dto.priority,
          riskLevel: dto.riskLevel,
          title: dto.title,
          summary: dto.summary,
          actionsTaken: dto.actionsTaken,
          followUpAt: dto.followUpAt ? new Date(dto.followUpAt) : dto.followUpAt === null ? null : undefined,
          closedAt: dto.status && (dto.status === MonitoringCaseStatus.RESOLVED || dto.status === MonitoringCaseStatus.CLOSED) ? new Date() : undefined
        }
      });

      if (dto.status && dto.status !== current.status) {
        await tx.monitoringCaseEvent.create({
          data: {
            caseId: id,
            actorId: user.sub,
            type: CaseEventType.STATUS_CHANGED,
            fromStatus: current.status,
            toStatus: dto.status,
            body: `Estado cambiado de ${current.status} a ${dto.status}`
          }
        });
      }

      if (dto.assignedToId && dto.assignedToId !== current.assignedToId) {
        await tx.monitoringCaseEvent.create({
          data: { caseId: id, actorId: user.sub, type: CaseEventType.ASSIGNED, body: "Responsable actualizado" }
        });
      }

      await tx.auditLog.create({
        data: { actorId: user.sub, action: AuditAction.CASE_UPDATED, entityType: "MonitoringCase", entityId: id, before: current, after: updated }
      });
      return updated;
    });
  }

  async comment(id: string, dto: CreateCaseCommentDto, user: CurrentUserPayload) {
    await this.findById(id, user);
    return this.prisma.$transaction(async (tx) => {
      const comment = await tx.monitoringCaseComment.create({ data: { caseId: id, authorId: user.sub, body: dto.body } });
      await tx.monitoringCaseEvent.create({ data: { caseId: id, actorId: user.sub, type: CaseEventType.COMMENTED, body: dto.body } });
      await tx.auditLog.create({ data: { actorId: user.sub, action: AuditAction.CASE_COMMENTED, entityType: "MonitoringCase", entityId: id, metadata: { commentId: comment.id } } });
      return comment;
    });
  }

  async timeline(id: string, user: CurrentUserPayload) {
    await this.findById(id, user);
    const [events, comments] = await Promise.all([
      this.prisma.monitoringCaseEvent.findMany({
        where: { caseId: id },
        include: { actor: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" }
      }),
      this.prisma.monitoringCaseComment.findMany({
        where: { caseId: id, deletedAt: null },
        include: { author: { select: { id: true, name: true, email: true } } },
        orderBy: { createdAt: "desc" }
      })
    ]);
    return {
      data: [
        ...events.map((event) => ({ id: event.id, type: event.type, body: event.body, actor: event.actor, createdAt: event.createdAt })),
        ...comments.map((comment) => ({ id: comment.id, type: "COMMENT", body: comment.body, actor: comment.author, createdAt: comment.createdAt }))
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    };
  }
}

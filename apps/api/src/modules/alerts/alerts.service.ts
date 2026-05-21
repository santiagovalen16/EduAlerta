import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { RoleKey } from "@prisma/client";
import { getStudentVisibilityWhere } from "../../common/authz/student-scope";
import { CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../database/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import { AlertsRepository } from "./alerts.repository";
import { CreateAlertCommentDto } from "./dto/create-alert-comment.dto";
import { CreateAlertDto } from "./dto/create-alert.dto";
import { QueryAlertsDto } from "./dto/query-alerts.dto";
import { UpdateAlertDto } from "./dto/update-alert.dto";

@Injectable()
export class AlertsService {
  private static readonly ACKNOWLEDGEMENT_MESSAGE = "Acudiente confirmó recibido.";

  constructor(
    private readonly prisma: PrismaService,
    private readonly alertsRepository: AlertsRepository,
    private readonly notificationsService: NotificationsService
  ) {}

  private async notifyAlertStakeholders(
    alert: Awaited<ReturnType<AlertsService["findById"]>>,
    user: CurrentUserPayload,
    message: string
  ) {
    const actor = await this.prisma.user.findUnique({
      where: { id: user.sub },
      select: { name: true, role: { select: { key: true } } }
    });
    const title = actor?.role.key === "RECTOR" ? "Respuesta del rector a una alerta" : "Actualizacion sobre una alerta";
    const body = `${actor?.name ?? "Equipo directivo"}: ${message}`;
    const recipients = new Map<string, { userId?: string | null; guardianId?: string | null; title: string; body: string; alertId?: string }>();

    if (alert.createdBy.id !== user.sub) {
      recipients.set(`user:${alert.createdBy.id}`, { userId: alert.createdBy.id, title, body, alertId: alert.id });
    }

    const teacherUserId = alert.teacher?.user.id ?? null;
    if (teacherUserId && teacherUserId !== user.sub) {
      recipients.set(`user:${teacherUserId}`, { userId: teacherUserId, title, body, alertId: alert.id });
    }

    for (const relation of alert.student.guardians) {
      const guardianUserId = relation.guardian.user?.id ?? null;
      if (guardianUserId === user.sub) continue;
      recipients.set(`guardian:${relation.guardianId}`, {
        guardianId: relation.guardianId,
        userId: guardianUserId,
        title,
        body,
        alertId: alert.id
      });
    }

    await this.notificationsService.createMany([...recipients.values()]);
  }

  async findMany(query: QueryAlertsDto, user: CurrentUserPayload) {
    const [total, data] = await this.alertsRepository.findMany({
      page: query.page,
      pageSize: query.pageSize,
      search: query.search,
      status: query.status,
      type: query.type,
      priority: query.priority,
      institutionId: query.institutionId,
      visibility: getStudentVisibilityWhere(user),
      teacherId: query.teacherId,
      from: query.from,
      to: query.to
    });

    return { data, meta: { total, page: query.page, pageSize: query.pageSize } };
  }

  async findById(id: string, user: CurrentUserPayload) {
    const alert = await this.alertsRepository.findById(id, getStudentVisibilityWhere(user));
    if (!alert) throw new NotFoundException("Alert not found");

    const authorIds = [...new Set(alert.comments.map((comment) => comment.authorId).filter((value): value is string => Boolean(value)))];
    const authors =
      authorIds.length > 0
        ? await this.prisma.user.findMany({
            where: { id: { in: authorIds } },
            select: { id: true, name: true, email: true }
          })
        : [];
    const authorMap = new Map(authors.map((author) => [author.id, author]));

    return {
      ...alert,
      comments: alert.comments.map((comment) => ({
        ...comment,
        author: comment.authorId ? authorMap.get(comment.authorId) ?? null : null
      })),
      acknowledgedByCurrentUser: alert.comments.some(
        (comment) => comment.authorId === user.sub && comment.body === AlertsService.ACKNOWLEDGEMENT_MESSAGE
      )
    };
  }

  async create(dto: CreateAlertDto, user: CurrentUserPayload) {
    const created = await this.prisma.$transaction(async (tx) => {
      const student = await tx.student.findFirst({ where: { id: dto.studentId, deletedAt: null, ...getStudentVisibilityWhere(user) } });
      if (!student) throw new NotFoundException("Student not found");
      const teacher = await tx.teacher.findFirst({ where: { userId: user.sub, deletedAt: null } });
      const alert = await tx.alert.upsert({
        where: { clientGeneratedId: dto.clientGeneratedId },
        update: {},
        create: {
          clientGeneratedId: dto.clientGeneratedId,
          studentId: dto.studentId,
          createdById: user.sub,
          teacherId: teacher?.id,
          type: dto.type,
          priority: dto.priority,
          description: dto.description
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: user.sub,
          action: "ALERT_CREATED",
          entityType: "Alert",
          entityId: alert.id,
          metadata: { studentId: dto.studentId, type: dto.type }
        }
      });

      return alert;
    });

    const detail = await this.findById(created.id, user);
    await this.notifyAlertStakeholders(detail, user, `Se registro una alerta ${created.type.toLowerCase()} con prioridad ${created.priority ?? "MEDIUM"}.`);
    return created;
  }

  async update(id: string, dto: UpdateAlertDto, user: CurrentUserPayload) {
    await this.findById(id, user);

    const alert = await this.prisma.$transaction(async (tx) => {
      const updated = await tx.alert.update({
        where: { id },
        data: {
          type: dto.type,
          status: dto.status,
          priority: dto.priority,
          description: dto.description,
          closedAt: dto.status === "CLOSED" ? new Date() : undefined
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: user.sub,
          action: "ALERT_UPDATED",
          entityType: "Alert",
          entityId: id,
          metadata: { ...dto }
        }
      });

      return updated;
    });

    const detail = await this.findById(id, user);
    await this.notifyAlertStakeholders(detail, user, `Se actualizo la alerta. Estado: ${detail.status}. Prioridad: ${detail.priority}.`);
    return alert;
  }

  async remove(id: string, user: CurrentUserPayload) {
    if (user.role === "DOCENTE") {
      throw new ForbiddenException("Teachers cannot delete alerts.");
    }
    await this.findById(id, user);
    const alert = await this.alertsRepository.softDelete(id);
    await this.prisma.auditLog.create({
      data: {
        actorId: user.sub,
        action: "ALERT_DELETED",
        entityType: "Alert",
        entityId: id
      }
    });
    return alert;
  }

  async comment(id: string, dto: CreateAlertCommentDto, user: CurrentUserPayload) {
    const alert = await this.findById(id, user);

    const comment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.alertComment.create({
        data: {
          alertId: id,
          authorId: user.sub,
          body: dto.body
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: user.sub,
          action: "ALERT_UPDATED",
          entityType: "Alert",
          entityId: id,
          metadata: { commentId: created.id, response: dto.body }
        }
      });

      return created;
    });

    await this.notifyAlertStakeholders(alert, user, dto.body);
    return comment;
  }

  async acknowledge(id: string, user: CurrentUserPayload) {
    if (user.role !== RoleKey.ACUDIENTE) {
      throw new ForbiddenException("Only guardians can acknowledge alerts.");
    }

    const alert = await this.findById(id, user);
    if (alert.acknowledgedByCurrentUser) {
      return { ok: true, alreadyAcknowledged: true };
    }

    const comment = await this.prisma.$transaction(async (tx) => {
      const created = await tx.alertComment.create({
        data: {
          alertId: id,
          authorId: user.sub,
          body: AlertsService.ACKNOWLEDGEMENT_MESSAGE
        }
      });

      await tx.auditLog.create({
        data: {
          actorId: user.sub,
          action: "ALERT_UPDATED",
          entityType: "Alert",
          entityId: id,
          metadata: { acknowledged: true, commentId: created.id }
        }
      });

      return created;
    });

    await this.notifyAlertStakeholders(alert, user, AlertsService.ACKNOWLEDGEMENT_MESSAGE);
    return { ok: true, alreadyAcknowledged: false, comment };
  }
}

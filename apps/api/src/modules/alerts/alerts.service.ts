import { Injectable, NotFoundException } from "@nestjs/common";
import { getStudentVisibilityWhere } from "../../common/authz/student-scope";
import { CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../database/prisma.service";
import { AlertsRepository } from "./alerts.repository";
import { CreateAlertDto } from "./dto/create-alert.dto";
import { QueryAlertsDto } from "./dto/query-alerts.dto";
import { UpdateAlertDto } from "./dto/update-alert.dto";

@Injectable()
export class AlertsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly alertsRepository: AlertsRepository
  ) {}

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
    return alert;
  }

  async create(dto: CreateAlertDto, user: CurrentUserPayload) {
    return this.prisma.$transaction(async (tx) => {
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

    return alert;
  }

  async remove(id: string, user: CurrentUserPayload) {
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
}

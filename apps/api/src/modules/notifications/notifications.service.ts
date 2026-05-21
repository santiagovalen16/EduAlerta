import { Injectable, NotFoundException } from "@nestjs/common";
import { AuditAction, NotificationChannel } from "@prisma/client";
import { CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  findMany(user: CurrentUserPayload) {
    return this.prisma.notification.findMany({
      where: { userId: user.sub, deletedAt: null },
      orderBy: { createdAt: "desc" },
      take: 30
    });
  }

  async unreadCount(user: CurrentUserPayload) {
    const count = await this.prisma.notification.count({ where: { userId: user.sub, readAt: null, deletedAt: null } });
    return { count };
  }

  async markRead(id: string, user: CurrentUserPayload) {
    const notification = await this.prisma.notification.findFirst({ where: { id, userId: user.sub, deletedAt: null } });
    if (!notification) throw new NotFoundException("Notification not found.");
    const updated = await this.prisma.notification.update({
      where: { id },
      data: { readAt: new Date(), status: "READ" }
    });
    await this.prisma.auditLog.create({
      data: { actorId: user.sub, action: AuditAction.NOTIFICATION_READ, entityType: "Notification", entityId: id }
    });
    return updated;
  }

  createForUser(userId: string, input: { title: string; body: string; alertId?: string }) {
    return this.prisma.notification.create({
      data: { userId, title: input.title, body: input.body, alertId: input.alertId, channel: NotificationChannel.IN_APP }
    });
  }

  createForGuardian(guardianId: string, userId: string | null, input: { title: string; body: string; alertId?: string }) {
    return this.prisma.notification.create({
      data: {
        guardianId,
        userId,
        title: input.title,
        body: input.body,
        alertId: input.alertId,
        channel: NotificationChannel.IN_APP
      }
    });
  }

  async createMany(input: Array<{ userId?: string | null; guardianId?: string | null; title: string; body: string; alertId?: string }>) {
    for (const item of input) {
      if (item.guardianId) {
        await this.createForGuardian(item.guardianId, item.userId ?? null, item);
      } else if (item.userId) {
        await this.createForUser(item.userId, item);
      }
    }
  }
}

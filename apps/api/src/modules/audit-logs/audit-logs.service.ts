import { Injectable } from "@nestjs/common";
import { CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class AuditLogsService {
  constructor(private readonly prisma: PrismaService) {}

  findForUser(user: CurrentUserPayload) {
    return this.prisma.auditLog.findMany({
      where: { actorId: user.sub },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true
      }
    });
  }
}

import { Injectable } from "@nestjs/common";
import { getStudentVisibilityWhere } from "../../common/authz/student-scope";
import { CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class ActivityService {
  constructor(private readonly prisma: PrismaService) {}

  async feed(user: CurrentUserPayload) {
    const visibility = getStudentVisibilityWhere(user);
    const [alerts, cases, incidents, observations] = await Promise.all([
      this.prisma.alert.findMany({
        where: { deletedAt: null, student: visibility },
        include: { student: { select: { firstName: true, lastName: true } }, createdBy: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10
      }),
      this.prisma.monitoringCase.findMany({
        where: { deletedAt: null, student: visibility },
        include: { student: { select: { firstName: true, lastName: true } }, assignedTo: { select: { name: true } } },
        orderBy: { updatedAt: "desc" },
        take: 10
      }),
      this.prisma.incident.findMany({
        where: { deletedAt: null, student: visibility },
        include: { student: { select: { firstName: true, lastName: true } }, reportedBy: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10
      }),
      this.prisma.observation.findMany({
        where: { deletedAt: null, student: visibility },
        include: { student: { select: { firstName: true, lastName: true } }, author: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 10
      })
    ]);

    return {
      data: [
        ...alerts.map((item) => ({ id: item.id, type: "alert", title: item.description, actor: item.createdBy.name, student: `${item.student.firstName} ${item.student.lastName}`, createdAt: item.createdAt })),
        ...cases.map((item) => ({ id: item.id, type: "case", title: item.title, actor: item.assignedTo?.name ?? "Sin responsable", student: `${item.student.firstName} ${item.student.lastName}`, createdAt: item.updatedAt })),
        ...incidents.map((item) => ({ id: item.id, type: "incident", title: item.title, actor: item.reportedBy?.name ?? "Sistema", student: `${item.student.firstName} ${item.student.lastName}`, createdAt: item.createdAt })),
        ...observations.map((item) => ({ id: item.id, type: "observation", title: item.title, actor: item.author?.name ?? "Sistema", student: `${item.student.firstName} ${item.student.lastName}`, createdAt: item.createdAt }))
      ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 30)
    };
  }
}

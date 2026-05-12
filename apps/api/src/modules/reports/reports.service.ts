import { Injectable } from "@nestjs/common";
import { AuditAction } from "@prisma/client";
import { getInstitutionScope } from "../../common/authz/tenant-scope";
import { CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async exportCsv(type = "alerts", user: CurrentUserPayload) {
    const institutionId = getInstitutionScope(user);
    const rows =
      type === "attendance"
        ? await this.prisma.attendance.findMany({ where: { deletedAt: null, student: { institutionId } }, include: { student: true, course: true }, take: 1000 })
        : await this.prisma.alert.findMany({ where: { deletedAt: null, student: { institutionId } }, include: { student: true, createdBy: true }, take: 1000 });

    await this.prisma.auditLog.create({
      data: { actorId: user.sub, action: AuditAction.REPORT_EXPORTED, entityType: "Report", metadata: { type } }
    });

    if (type === "attendance") {
      return [
        ["student", "course", "date", "status", "notes"],
        ...rows.map((row) => {
          const item = row as Awaited<ReturnType<typeof this.prisma.attendance.findMany>>[number] & { student: { firstName: string; lastName: string }; course: { name: string } };
          return [`${item.student.firstName} ${item.student.lastName}`, item.course.name, item.date.toISOString(), item.status, item.notes ?? ""];
        })
      ].map(csvRow).join("\n");
    }

    return [
      ["student", "type", "priority", "status", "description", "createdAt"],
      ...rows.map((row) => {
        const item = row as Awaited<ReturnType<typeof this.prisma.alert.findMany>>[number] & { student: { firstName: string; lastName: string } };
        return [`${item.student.firstName} ${item.student.lastName}`, item.type, item.priority, item.status, item.description, item.createdAt.toISOString()];
      })
    ].map(csvRow).join("\n");
  }
}

function csvRow(values: Array<string | number>) {
  return values.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(",");
}

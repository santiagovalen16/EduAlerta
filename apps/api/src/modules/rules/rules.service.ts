import { Injectable, OnModuleInit } from "@nestjs/common";
import { AlertPriority, AlertType, RiskLevel } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class RulesService implements OnModuleInit {
  private timer?: NodeJS.Timeout;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    if (process.env.NODE_ENV === "test") return;
    this.timer = setInterval(() => void this.evaluateAll(), 60 * 60 * 1000);
    this.timer.unref?.();
  }

  async evaluateAll() {
    const students = await this.prisma.student.findMany({
      where: { deletedAt: null },
      include: {
        attendance: { where: { deletedAt: null }, orderBy: { date: "desc" }, take: 20 },
        academicRecords: { where: { deletedAt: null }, orderBy: { recordedAt: "desc" }, take: 8 },
        incidents: { where: { deletedAt: null }, orderBy: { occurredAt: "desc" }, take: 5 },
        observations: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 5 }
      }
    });

    let created = 0;
    for (const student of students) {
      const attendanceRate =
        student.attendance.length === 0
          ? 100
          : Math.round((student.attendance.filter((item) => item.status === "PRESENT" || item.status === "LATE").length / student.attendance.length) * 100);
      const average =
        student.academicRecords.length === 0
          ? 5
          : student.academicRecords.reduce((sum, item) => sum + item.score, 0) / student.academicRecords.length;
      const negativeObservations = student.observations.filter((item) => item.isPositive === false && ["HIGH", "CRITICAL"].includes(item.severity)).length;

      const rules = [
        attendanceRate < 70 ? { type: AlertType.ATTENDANCE, priority: AlertPriority.HIGH, description: `Asistencia critica: ${attendanceRate}% en los ultimos registros.` } : null,
        average < 3 ? { type: AlertType.ACADEMIC, priority: AlertPriority.HIGH, description: `Bajo rendimiento academico: promedio ${average.toFixed(2)}.` } : null,
        student.incidents.length >= 3 ? { type: AlertType.BEHAVIOR, priority: AlertPriority.CRITICAL, description: "Multiples incidentes recientes requieren intervencion." } : null,
        negativeObservations >= 2 ? { type: AlertType.BEHAVIOR, priority: AlertPriority.HIGH, description: "Observaciones negativas recurrentes detectadas." } : null
      ].filter(Boolean) as Array<{ type: AlertType; priority: AlertPriority; description: string }>;

      for (const rule of rules) {
        const clientGeneratedId = `auto-${student.id}-${rule.type}-${new Date().toISOString().slice(0, 10)}`;
        const alert = await this.prisma.alert.upsert({
          where: { clientGeneratedId },
          update: {},
          create: {
            clientGeneratedId,
            studentId: student.id,
            createdById: await this.systemUserId(),
            type: rule.type,
            priority: rule.priority,
            description: rule.description
          }
        });
        if (alert.createdAt.getTime() > Date.now() - 5000) created++;
        if (student.riskLevel !== RiskLevel.CRITICAL && rule.priority === AlertPriority.CRITICAL) {
          await this.prisma.student.update({ where: { id: student.id }, data: { riskLevel: RiskLevel.CRITICAL } });
        }
      }
    }

    return { evaluated: students.length, created };
  }

  private async systemUserId() {
    const user = await this.prisma.user.findFirst({ where: { role: { key: "SUPER_ADMIN" }, deletedAt: null }, orderBy: { createdAt: "asc" } });
    if (!user) throw new Error("System user not found.");
    return user.id;
  }
}

import { Injectable } from "@nestjs/common";
import { AttendanceStatus, RiskLevel } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class DashboardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async metrics() {
    const [totalStudents, highRiskStudents, criticalStudents, openAlerts, todayAlerts, attendanceTotal, attendancePresent] =
      await Promise.all([
        this.prisma.student.count({ where: { deletedAt: null } }),
        this.prisma.student.count({ where: { deletedAt: null, riskLevel: { in: ["HIGH", "CRITICAL"] } } }),
        this.prisma.student.count({ where: { deletedAt: null, riskLevel: "CRITICAL" } }),
        this.prisma.alert.count({ where: { deletedAt: null, status: { in: ["NEW", "IN_REVIEW", "ESCALATED"] } } }),
        this.prisma.alert.count({
          where: {
            deletedAt: null,
            createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) }
          }
        }),
        this.prisma.attendance.count({ where: { deletedAt: null } }),
        this.prisma.attendance.count({ where: { deletedAt: null, status: AttendanceStatus.PRESENT } })
      ]);

    return {
      totalStudents,
      highRiskStudents,
      criticalStudents,
      openAlerts,
      todayAlerts,
      attendanceAverage: attendanceTotal === 0 ? 0 : Math.round((attendancePresent / attendanceTotal) * 100)
    };
  }

  riskTrend() {
    return this.prisma.student.groupBy({
      by: ["riskLevel"],
      where: { deletedAt: null },
      _count: { _all: true }
    });
  }

  alertsByType() {
    return this.prisma.alert.groupBy({
      by: ["type"],
      where: { deletedAt: null },
      _count: { _all: true }
    });
  }

  priorityStudents() {
    const riskOrder: RiskLevel[] = ["CRITICAL", "HIGH", "MEDIUM"];
    return this.prisma.student.findMany({
      where: { deletedAt: null, riskLevel: { in: riskOrder } },
      include: {
        course: true,
        alerts: { where: { deletedAt: null }, orderBy: { createdAt: "desc" }, take: 1 },
        _count: { select: { alerts: true, incidents: true } }
      },
      orderBy: [{ riskLevel: "desc" }, { updatedAt: "desc" }],
      take: 6
    });
  }

  recentAlerts() {
    return this.prisma.alert.findMany({
      where: { deletedAt: null },
      include: {
        student: { include: { course: true } },
        createdBy: { select: { id: true, name: true, email: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 8
    });
  }
}

import { Injectable } from "@nestjs/common";
import { Prisma, RiskLevel } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class MonitoringRepository {
  constructor(private readonly prisma: PrismaService) {}

  async metrics(visibility?: Prisma.StudentWhereInput) {
    const [critical, high, medium, low, activeAlerts] = await Promise.all([
      this.prisma.student.count({ where: { deletedAt: null, ...visibility, riskLevel: "CRITICAL" } }),
      this.prisma.student.count({ where: { deletedAt: null, ...visibility, riskLevel: "HIGH" } }),
      this.prisma.student.count({ where: { deletedAt: null, ...visibility, riskLevel: "MEDIUM" } }),
      this.prisma.student.count({ where: { deletedAt: null, ...visibility, riskLevel: "LOW" } }),
      this.prisma.alert.count({ where: { deletedAt: null, status: { in: ["NEW", "IN_REVIEW", "ESCALATED"] }, student: visibility } })
    ]);
    return { critical, high, medium, low, activeAlerts };
  }

  findStudents(filters: { search?: string; riskLevel?: RiskLevel; visibility?: Prisma.StudentWhereInput; page: number; pageSize: number; sort?: string }) {
    const where: Prisma.StudentWhereInput = {
      deletedAt: null,
      ...filters.visibility,
      ...(filters.riskLevel ? { riskLevel: filters.riskLevel } : {}),
      ...(filters.search
        ? {
            OR: [
              { firstName: { contains: filters.search, mode: "insensitive" } },
              { lastName: { contains: filters.search, mode: "insensitive" } },
              { documentNumber: { contains: filters.search, mode: "insensitive" } },
              { institution: { name: { contains: filters.search, mode: "insensitive" } } }
            ]
          }
        : {})
    };

    return this.prisma.$transaction([
      this.prisma.student.count({ where }),
      this.prisma.student.findMany({
        where,
        include: {
          course: true,
          institution: { include: { municipality: true } },
          guardians: { where: { deletedAt: null }, include: { guardian: { include: { user: { select: { name: true, email: true } } } } } },
          alerts: { where: { deletedAt: null, status: { not: "CLOSED" } } },
          attendance: { where: { deletedAt: null }, orderBy: { date: "desc" }, take: 20 },
          academicRecords: { where: { deletedAt: null }, orderBy: { recordedAt: "desc" }, take: 10 },
          monitoringCases: { where: { deletedAt: null }, orderBy: { openedAt: "desc" }, take: 3 }
        },
        orderBy:
          filters.sort === "name"
            ? [{ lastName: "asc" }, { firstName: "asc" }]
            : filters.sort === "risk"
              ? [{ riskLevel: "desc" }, { lastName: "asc" }]
              : [{ updatedAt: "desc" }],
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize
      })
    ]);
  }
}

import { Injectable } from "@nestjs/common";
import { Prisma, RiskLevel } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class StudentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(filters: { search?: string; riskLevel?: RiskLevel; visibility?: Prisma.StudentWhereInput; page: number; pageSize: number }) {
    const where: Prisma.StudentWhereInput = {
      deletedAt: null,
      ...filters.visibility,
      ...(filters.riskLevel ? { riskLevel: filters.riskLevel } : {}),
      ...(filters.search
        ? {
            OR: [
              { firstName: { contains: filters.search, mode: "insensitive" } },
              { lastName: { contains: filters.search, mode: "insensitive" } },
              { documentNumber: { contains: filters.search, mode: "insensitive" } }
            ]
          }
        : {})
    };

    return this.prisma.$transaction([
      this.prisma.student.count({ where }),
      this.prisma.student.findMany({
        where,
        include: {
          institution: { include: { municipality: true } },
          course: true,
          guardians: { where: { deletedAt: null }, include: { guardian: { include: { user: { select: { id: true, name: true, email: true } } } } } },
          _count: { select: { alerts: true, attendance: true, incidents: true } }
        },
        orderBy: [{ riskLevel: "desc" }, { lastName: "asc" }, { firstName: "asc" }],
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize
      })
    ]);
  }

  findAtRisk(limit = 5, visibility?: Prisma.StudentWhereInput) {
    return this.prisma.student.findMany({
      where: {
        deletedAt: null,
        ...visibility,
        riskLevel: { in: ["MEDIUM", "HIGH", "CRITICAL"] }
      },
      include: {
        institution: true,
        course: true,
        alerts: {
          where: { deletedAt: null },
          orderBy: { createdAt: "desc" },
          take: 3
        }
      },
      orderBy: [{ riskLevel: "desc" }, { lastName: "asc" }],
      take: limit
    });
  }

  findById(id: string, visibility?: Prisma.StudentWhereInput) {
    return this.prisma.student.findFirst({
      where: { id, deletedAt: null, ...visibility },
      include: {
        institution: { include: { municipality: true } },
        course: true,
        alerts: { where: { deletedAt: null }, orderBy: { createdAt: "desc" } },
        attendance: { where: { deletedAt: null }, orderBy: { date: "desc" }, take: 20 },
        incidents: { where: { deletedAt: null }, orderBy: { occurredAt: "desc" }, take: 20 },
        guardians: { where: { deletedAt: null }, include: { guardian: { include: { user: { select: { id: true, name: true, email: true } } } } } }
      }
    });
  }

  create(data: Prisma.StudentUncheckedCreateInput) {
    return this.prisma.student.create({ data });
  }

  update(id: string, data: Prisma.StudentUpdateInput) {
    return this.prisma.student.update({ where: { id }, data });
  }

  softDelete(id: string) {
    return this.prisma.student.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

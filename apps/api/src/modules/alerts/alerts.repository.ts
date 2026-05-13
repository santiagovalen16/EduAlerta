import { Injectable } from "@nestjs/common";
import { AlertPriority, AlertStatus, AlertType, Prisma } from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class AlertsRepository {
  constructor(private readonly prisma: PrismaService) {}

  findMany(filters: {
    status?: AlertStatus;
    type?: AlertType;
    priority?: AlertPriority;
    institutionId?: string;
    visibility?: Prisma.StudentWhereInput;
    teacherId?: string;
    from?: string;
    to?: string;
    search?: string;
    page: number;
    pageSize: number;
  }) {
    const where: Prisma.AlertWhereInput = {
      deletedAt: null,
      ...(filters.status ? { status: filters.status } : {}),
      ...(filters.type ? { type: filters.type } : {}),
      ...(filters.priority ? { priority: filters.priority } : {}),
      ...(filters.teacherId ? { teacherId: filters.teacherId } : {}),
      ...(filters.visibility || filters.institutionId ? { student: { ...filters.visibility, ...(filters.institutionId ? { institutionId: filters.institutionId } : {}) } } : {}),
      ...(filters.from || filters.to
        ? { createdAt: { gte: filters.from ? new Date(filters.from) : undefined, lte: filters.to ? new Date(filters.to) : undefined } }
        : {}),
      ...(filters.search
        ? {
            OR: [
              { description: { contains: filters.search, mode: "insensitive" } },
              { student: { firstName: { contains: filters.search, mode: "insensitive" } } },
              { student: { lastName: { contains: filters.search, mode: "insensitive" } } }
            ]
          }
        : {})
    };

    return this.prisma.$transaction([
      this.prisma.alert.count({ where }),
      this.prisma.alert.findMany({
        where,
        include: {
          student: { include: { course: true, institution: { include: { municipality: true } } } },
          createdBy: { select: { id: true, name: true, email: true } },
          teacher: { include: { user: { select: { id: true, name: true, email: true } } } }
        },
        orderBy: { createdAt: "desc" },
        skip: (filters.page - 1) * filters.pageSize,
        take: filters.pageSize
      })
    ]);
  }

  findById(id: string, visibility?: Prisma.StudentWhereInput) {
    return this.prisma.alert.findFirst({
      where: { id, deletedAt: null, student: visibility },
      include: {
        student: { include: { course: true, guardians: { where: { deletedAt: null }, include: { guardian: { include: { user: true } } } } } },
        createdBy: { select: { id: true, name: true, email: true } },
        teacher: { include: { user: { select: { id: true, name: true, email: true } } } }
      }
    });
  }

  create(data: Prisma.AlertUncheckedCreateInput) {
    return this.prisma.alert.upsert({
      where: { clientGeneratedId: data.clientGeneratedId },
      update: {},
      create: data
    });
  }

  update(id: string, data: Prisma.AlertUpdateInput) {
    return this.prisma.alert.update({ where: { id }, data });
  }

  softDelete(id: string) {
    return this.prisma.alert.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}

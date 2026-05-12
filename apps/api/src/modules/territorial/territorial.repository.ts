import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";

@Injectable()
export class TerritorialRepository {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [students, activeAlerts, municipalities, institutions, criticalRisk] = await Promise.all([
      this.prisma.student.count({ where: { deletedAt: null } }),
      this.prisma.alert.count({ where: { deletedAt: null, status: { in: ["NEW", "IN_REVIEW", "ESCALATED"] } } }),
      this.prisma.municipality.count({ where: { deletedAt: null } }),
      this.prisma.institution.count({ where: { deletedAt: null } }),
      this.prisma.student.count({ where: { deletedAt: null, riskLevel: "CRITICAL" } })
    ]);

    return { students, activeAlerts, municipalities, institutions, criticalRisk };
  }

  alertsByMunicipality() {
    return this.prisma.municipality.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        latitude: true,
        longitude: true,
        institutions: {
          where: { deletedAt: null },
          select: {
            id: true,
            students: { where: { deletedAt: null }, select: { alerts: { where: { deletedAt: null }, select: { id: true } } } }
          }
        }
      }
    });
  }

  institutions() {
    return this.prisma.institution.findMany({
      where: { deletedAt: null },
      include: {
        municipality: true,
        students: {
          where: { deletedAt: null },
          include: { alerts: { where: { deletedAt: null } } }
        }
      },
      orderBy: { name: "asc" }
    });
  }

  monthlyEvolution() {
    return this.prisma.alert.findMany({
      where: { deletedAt: null },
      select: { createdAt: true, status: true },
      orderBy: { createdAt: "asc" }
    });
  }

  riskDistribution() {
    return this.prisma.student.groupBy({
      by: ["riskLevel"],
      where: { deletedAt: null },
      _count: { _all: true }
    });
  }
}

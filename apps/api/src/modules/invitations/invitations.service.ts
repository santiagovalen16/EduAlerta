import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { AuditAction, InvitationStatus, Prisma } from "@prisma/client";
import { randomBytes, createHash } from "node:crypto";
import { CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../database/prisma.service";
import { CreateInvitationDto } from "./dto/create-invitation.dto";
import { QueryInvitationsDto } from "./dto/query-invitations.dto";

@Injectable()
export class InvitationsService {
  constructor(private readonly prisma: PrismaService) {}

  async findMany(query: QueryInvitationsDto) {
    const page = query.page ?? 1;
    const pageSize = query.pageSize ?? 20;
    const where: Prisma.InvitationWhereInput = {
      email: query.email,
      roleKey: query.roleKey,
      status: query.status,
      institutionId: query.institutionId
    };

    const [total, data] = await this.prisma.$transaction([
      this.prisma.invitation.count({ where }),
      this.prisma.invitation.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
        include: {
          institution: { select: { id: true, name: true } },
          invitedBy: { select: { id: true, name: true, email: true } }
        }
      })
    ]);

    return {
      data,
      meta: {
        page,
        pageSize,
        total,
        pageCount: Math.ceil(total / pageSize)
      }
    };
  }

  async create(dto: CreateInvitationDto, user: CurrentUserPayload) {
    const existingUser = await this.prisma.user.findUnique({ where: { email: dto.email.toLowerCase() } });
    if (existingUser) {
      throw new BadRequestException("Ya existe un usuario con este correo.");
    }

    if (dto.institutionId) {
      const institution = await this.prisma.institution.findFirst({
        where: { id: dto.institutionId, deletedAt: null }
      });
      if (!institution) throw new BadRequestException("La institucion no existe o fue eliminada.");
    }

    const invitationToken = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + (dto.expiresInDays ?? 7) * 24 * 60 * 60 * 1000);

    const invitation = await this.prisma.invitation.create({
      data: {
        email: dto.email.toLowerCase(),
        roleKey: dto.roleKey,
        institutionId: dto.institutionId,
        tokenHash: this.hashToken(invitationToken),
        invitedById: user.sub,
        expiresAt
      },
      include: {
        institution: { select: { id: true, name: true } },
        invitedBy: { select: { id: true, name: true, email: true } }
      }
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: user.sub,
        action: AuditAction.INVITATION_CREATED,
        entityType: "Invitation",
        entityId: invitation.id,
        metadata: {
          email: invitation.email,
          roleKey: invitation.roleKey,
          institutionId: invitation.institutionId
        }
      }
    });

    return {
      invitation,
      invitationToken
    };
  }

  async revoke(id: string, user: CurrentUserPayload) {
    const invitation = await this.prisma.invitation.findUnique({ where: { id } });
    if (!invitation) throw new NotFoundException("Invitacion no encontrada.");
    if (invitation.status !== InvitationStatus.PENDING) {
      throw new BadRequestException("Solo se pueden revocar invitaciones pendientes.");
    }

    const updated = await this.prisma.invitation.update({
      where: { id },
      data: { status: InvitationStatus.REVOKED }
    });

    await this.prisma.auditLog.create({
      data: {
        actorId: user.sub,
        action: AuditAction.INVITATION_REVOKED,
        entityType: "Invitation",
        entityId: id,
        metadata: { revoked: true }
      }
    });

    return updated;
  }

  private hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }
}

import { BadRequestException, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../database/prisma.service";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { UpdateProfileDto } from "./dto/update-profile.dto";
import { UpdatePreferencesDto } from "./dto/update-preferences.dto";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  me(user: CurrentUserPayload) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: user.sub },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        position: true,
        emailVerifiedAt: true,
        onboardingCompletedAt: true,
        preferences: true,
        institution: { select: { id: true, name: true } },
        role: { select: { key: true, name: true } }
      }
    });
  }

  updateMe(user: CurrentUserPayload, dto: UpdateProfileDto) {
    return this.prisma.user.update({
      where: { id: user.sub },
      data: dto,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        avatarUrl: true,
        position: true,
        institution: { select: { id: true, name: true } },
        role: { select: { key: true, name: true } }
      }
    });
  }

  async changePassword(user: CurrentUserPayload, dto: ChangePasswordDto) {
    const record = await this.prisma.user.findUniqueOrThrow({ where: { id: user.sub } });
    if (!(await bcrypt.compare(dto.currentPassword, record.passwordHash))) {
      throw new BadRequestException("Current password is invalid");
    }

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: user.sub }, data: { passwordHash: await bcrypt.hash(dto.newPassword, 12) } }),
      this.prisma.session.updateMany({ where: { userId: user.sub, revokedAt: null }, data: { revokedAt: new Date() } })
    ]);

    return { ok: true };
  }

  async updatePreferences(user: CurrentUserPayload, dto: UpdatePreferencesDto) {
    const record = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.sub },
      select: { preferences: true }
    });

    const preferences = {
      ...(typeof record.preferences === "object" && record.preferences !== null && !Array.isArray(record.preferences)
        ? record.preferences
        : {}),
      ...dto
    };

    return this.prisma.user.update({
      where: { id: user.sub },
      data: { preferences },
      select: {
        id: true,
        preferences: true,
        onboardingCompletedAt: true
      }
    });
  }

  async completeOnboarding(user: CurrentUserPayload, dto: UpdatePreferencesDto) {
    const updated = await this.updatePreferences(user, dto);
    return this.prisma.user.update({
      where: { id: user.sub },
      data: { onboardingCompletedAt: new Date() },
      select: {
        id: true,
        onboardingCompletedAt: true,
        preferences: true
      }
    });
  }

  sessions(user: CurrentUserPayload) {
    return this.prisma.session.findMany({
      where: { userId: user.sub, deletedAt: null },
      select: { id: true, userAgent: true, ipAddress: true, createdAt: true, expiresAt: true, revokedAt: true },
      orderBy: { createdAt: "desc" }
    });
  }

  async revokeSession(user: CurrentUserPayload, id: string) {
    await this.prisma.session.updateMany({
      where: { id, userId: user.sub, revokedAt: null },
      data: { revokedAt: new Date() }
    });

    return { ok: true };
  }
}

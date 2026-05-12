import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { RoleKey } from "@prisma/client";
import * as bcrypt from "bcrypt";
import { createHash, randomBytes } from "crypto";
import { CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../database/prisma.service";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { LoginDto } from "./dto/login.dto";
import { RefreshTokenDto } from "./dto/refresh-token.dto";
import { RegisterDto } from "./dto/register.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";

type RequestMeta = {
  ipAddress?: string;
  userAgent?: string;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService
  ) {}

  private hashToken(token: string) {
    return createHash("sha256").update(token).digest("hex");
  }

  private async getUserForAuth(email: string) {
    return this.prisma.user.findFirst({
      where: { email, deletedAt: null, disabledAt: null },
      select: {
        id: true,
        email: true,
        name: true,
        passwordHash: true,
        emailVerifiedAt: true,
        onboardingCompletedAt: true,
        institution: { select: { id: true, name: true } },
        role: {
          select: {
            key: true,
            permissions: { select: { permission: { select: { key: true } } } }
          }
        }
      }
    });
  }

  private permissions(user: NonNullable<Awaited<ReturnType<AuthService["getUserForAuth"]>>>) {
    return user.role.permissions.map((rolePermission) => rolePermission.permission.key);
  }

  private async signAccessToken(user: NonNullable<Awaited<ReturnType<AuthService["getUserForAuth"]>>>, sessionId: string) {
    return this.jwt.signAsync(
      {
        sub: user.id,
        email: user.email,
        role: user.role.key,
        permissions: this.permissions(user),
        institutionId: user.institution?.id ?? null,
        sessionId,
        onboardingCompletedAt: user.onboardingCompletedAt?.toISOString() ?? null
      },
      {
        secret: this.config.getOrThrow<string>("JWT_ACCESS_SECRET"),
        expiresIn: this.config.get<string>("JWT_ACCESS_EXPIRES_IN") ?? "15m"
      }
    );
  }

  private async createSession(userId: string, meta?: RequestMeta) {
    const secret = randomBytes(48).toString("base64url");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await this.prisma.session.create({
      data: {
        userId,
        refreshTokenHash: this.hashToken(secret),
        userAgent: meta?.userAgent,
        ipAddress: meta?.ipAddress,
        expiresAt
      }
    });

    return { session, refreshToken: `${session.id}.${secret}` };
  }

  private serializeUser(user: NonNullable<Awaited<ReturnType<AuthService["getUserForAuth"]>>>) {
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role.key,
      permissions: this.permissions(user),
      institution: user.institution,
      emailVerifiedAt: user.emailVerifiedAt,
      onboardingCompletedAt: user.onboardingCompletedAt
    };
  }

  async login(dto: LoginDto, meta?: RequestMeta) {
    const user = await this.getUserForAuth(dto.email);

    if (!user || !(await bcrypt.compare(dto.password, user.passwordHash))) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const { session, refreshToken } = await this.createSession(user.id, meta);
    await this.prisma.auditLog.create({
      data: { actorId: user.id, action: "LOGIN", entityType: "Session", entityId: session.id, ipAddress: meta?.ipAddress, userAgent: meta?.userAgent }
    });

    return {
      accessToken: await this.signAccessToken(user, session.id),
      refreshToken,
      user: this.serializeUser(user)
    };
  }

  async register(dto: RegisterDto, meta?: RequestMeta) {
    const usersCount = await this.prisma.user.count();
    let roleKey: RoleKey = "SUPER_ADMIN";
    let institutionId: string | undefined;
    let invitationId: string | undefined;

    if (usersCount > 0) {
      if (!dto.invitationToken) throw new ForbiddenException("Registration requires an invitation");
      const tokenHash = this.hashToken(dto.invitationToken);
      const invitation = await this.prisma.invitation.findFirst({
        where: { tokenHash, status: "PENDING", expiresAt: { gt: new Date() }, deletedAt: null }
      });
      if (!invitation) throw new BadRequestException("Invalid invitation");
      roleKey = invitation.roleKey;
      institutionId = invitation.institutionId ?? undefined;
      invitationId = invitation.id;
    }

    const role = await this.prisma.role.findUniqueOrThrow({ where: { key: roleKey } });
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        name: dto.name,
        phone: dto.phone,
        passwordHash,
        roleId: role.id,
        institutionId,
        institutionMemberships: institutionId
          ? { create: { institutionId, roleKey } }
          : undefined
      }
    });

    if (invitationId) {
      await this.prisma.invitation.update({ where: { id: invitationId }, data: { status: "ACCEPTED", acceptedAt: new Date() } });
    }

    await this.prisma.auditLog.create({
      data: { actorId: user.id, action: "USER_REGISTERED", entityType: "User", entityId: user.id, ipAddress: meta?.ipAddress, userAgent: meta?.userAgent }
    });

    return this.login({ email: dto.email, password: dto.password }, meta);
  }

  async refresh(dto: RefreshTokenDto, meta?: RequestMeta) {
    const [sessionId, secret] = dto.refreshToken.split(".");
    if (!sessionId || !secret) throw new UnauthorizedException("Invalid refresh token");

    const session = await this.prisma.session.findFirst({
      where: { id: sessionId, revokedAt: null, deletedAt: null, expiresAt: { gt: new Date() } },
      include: { user: { include: { role: { include: { permissions: { include: { permission: true } } } }, institution: true } } }
    });

    if (!session || session.refreshTokenHash !== this.hashToken(secret)) {
      throw new UnauthorizedException("Invalid refresh token");
    }

    await this.prisma.session.update({ where: { id: session.id }, data: { revokedAt: new Date() } });
    const user = await this.getUserForAuth(session.user.email);
    if (!user) throw new UnauthorizedException("User not found");

    const nextSession = await this.createSession(user.id, meta);
    await this.prisma.auditLog.create({
      data: { actorId: user.id, action: "TOKEN_REFRESHED", entityType: "Session", entityId: nextSession.session.id }
    });

    return {
      accessToken: await this.signAccessToken(user, nextSession.session.id),
      refreshToken: nextSession.refreshToken,
      user: this.serializeUser(user)
    };
  }

  async logout(user: CurrentUserPayload) {
    if (user.sessionId) {
      await this.prisma.session.updateMany({
        where: { id: user.sessionId, userId: user.sub, revokedAt: null },
        data: { revokedAt: new Date() }
      });
    }
    await this.prisma.auditLog.create({ data: { actorId: user.sub, action: "LOGOUT", entityType: "Session", entityId: user.sessionId } });
    return { ok: true };
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.prisma.user.findFirst({ where: { email: dto.email, deletedAt: null } });
    if (!user) return { ok: true };

    const token = randomBytes(32).toString("base64url");
    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash: this.hashToken(token),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000)
      }
    });
    await this.prisma.auditLog.create({ data: { actorId: user.id, action: "PASSWORD_RESET_REQUESTED", entityType: "User", entityId: user.id } });

    return { ok: true, resetToken: token };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const tokenHash = this.hashToken(dto.token);
    const resetToken = await this.prisma.passwordResetToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } }
    });
    if (!resetToken) throw new BadRequestException("Invalid reset token");

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: resetToken.userId }, data: { passwordHash: await bcrypt.hash(dto.password, 12) } }),
      this.prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
      this.prisma.session.updateMany({ where: { userId: resetToken.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
      this.prisma.auditLog.create({
        data: { actorId: resetToken.userId, action: "PASSWORD_RESET_COMPLETED", entityType: "User", entityId: resetToken.userId }
      })
    ]);

    return { ok: true };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const tokenHash = this.hashToken(dto.token);
    const token = await this.prisma.emailVerificationToken.findFirst({
      where: { tokenHash, usedAt: null, expiresAt: { gt: new Date() } }
    });
    if (!token) throw new BadRequestException("Invalid verification token");

    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: token.userId }, data: { emailVerifiedAt: new Date() } }),
      this.prisma.emailVerificationToken.update({ where: { id: token.id }, data: { usedAt: new Date() } })
    ]);

    return { ok: true };
  }

  async me(user: CurrentUserPayload) {
    const record = await this.getUserForAuth(user.email);
    if (!record) throw new UnauthorizedException("User not found");
    return this.serializeUser(record);
  }
}

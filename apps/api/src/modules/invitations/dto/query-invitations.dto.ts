import { ApiPropertyOptional } from "@nestjs/swagger";
import { InvitationStatus, RoleKey } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEmail, IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from "class-validator";

export class QueryInvitationsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ enum: RoleKey })
  @IsOptional()
  @IsEnum(RoleKey)
  roleKey?: RoleKey;

  @ApiPropertyOptional({ enum: InvitationStatus })
  @IsOptional()
  @IsEnum(InvitationStatus)
  status?: InvitationStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  institutionId?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize?: number = 20;
}

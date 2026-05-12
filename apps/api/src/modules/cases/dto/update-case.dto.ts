import { ApiPropertyOptional } from "@nestjs/swagger";
import { AlertPriority, MonitoringCaseStatus, RiskLevel } from "@prisma/client";
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from "class-validator";

export class UpdateCaseDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assignedToId?: string | null;

  @ApiPropertyOptional({ enum: MonitoringCaseStatus })
  @IsOptional()
  @IsEnum(MonitoringCaseStatus)
  status?: MonitoringCaseStatus;

  @ApiPropertyOptional({ enum: AlertPriority })
  @IsOptional()
  @IsEnum(AlertPriority)
  priority?: AlertPriority;

  @ApiPropertyOptional({ enum: RiskLevel })
  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(160)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  summary?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  actionsTaken?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  followUpAt?: string | null;
}

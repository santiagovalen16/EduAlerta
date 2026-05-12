import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { AlertPriority, RiskLevel } from "@prisma/client";
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreateCaseDto {
  @ApiProperty()
  @IsUUID()
  studentId!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  assignedToId?: string;

  @ApiProperty({ enum: RiskLevel })
  @IsEnum(RiskLevel)
  riskLevel!: RiskLevel;

  @ApiPropertyOptional({ enum: AlertPriority })
  @IsOptional()
  @IsEnum(AlertPriority)
  priority?: AlertPriority;

  @ApiProperty()
  @IsString()
  @MinLength(4)
  @MaxLength(160)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  summary!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  followUpAt?: string;
}

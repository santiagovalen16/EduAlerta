import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IncidentType, MonitoringCaseStatus, ObservationSeverity } from "@prisma/client";
import { IsDateString, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreateIncidentDto {
  @ApiProperty()
  @IsUUID()
  studentId!: string;

  @ApiProperty({ enum: IncidentType })
  @IsEnum(IncidentType)
  type!: IncidentType;

  @ApiPropertyOptional({ enum: ObservationSeverity })
  @IsOptional()
  @IsEnum(ObservationSeverity)
  severity?: ObservationSeverity;

  @ApiPropertyOptional({ enum: MonitoringCaseStatus })
  @IsOptional()
  @IsEnum(MonitoringCaseStatus)
  status?: MonitoringCaseStatus;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  description!: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  witnesses?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  evidenceNotes?: string;

  @ApiProperty()
  @IsDateString()
  occurredAt!: string;
}

import { ApiPropertyOptional } from "@nestjs/swagger";
import { IncidentType, MonitoringCaseStatus, ObservationSeverity } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export class QueryIncidentsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ enum: IncidentType })
  @IsOptional()
  @IsEnum(IncidentType)
  type?: IncidentType;

  @ApiPropertyOptional({ enum: MonitoringCaseStatus })
  @IsOptional()
  @IsEnum(MonitoringCaseStatus)
  status?: MonitoringCaseStatus;

  @ApiPropertyOptional({ enum: ObservationSeverity })
  @IsOptional()
  @IsEnum(ObservationSeverity)
  severity?: ObservationSeverity;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  pageSize = 20;
}

import { ApiPropertyOptional } from "@nestjs/swagger";
import { ObservationCategory, ObservationSeverity } from "@prisma/client";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export class QueryObservationsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  studentId?: string;

  @ApiPropertyOptional({ enum: ObservationCategory })
  @IsOptional()
  @IsEnum(ObservationCategory)
  category?: ObservationCategory;

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

import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { ObservationCategory, ObservationSeverity } from "@prisma/client";
import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, MaxLength, MinLength } from "class-validator";

export class CreateObservationDto {
  @ApiProperty()
  @IsUUID()
  studentId!: string;

  @ApiProperty({ enum: ObservationCategory })
  @IsEnum(ObservationCategory)
  category!: ObservationCategory;

  @ApiPropertyOptional({ enum: ObservationSeverity })
  @IsOptional()
  @IsEnum(ObservationSeverity)
  severity?: ObservationSeverity;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isPositive?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  followUpRequired?: boolean;

  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(160)
  title!: string;

  @ApiProperty()
  @IsString()
  @MinLength(5)
  description!: string;
}

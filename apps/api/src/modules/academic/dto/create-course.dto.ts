import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, IsUUID, Max, MaxLength, Min } from "class-validator";

export class CreateCourseDto {
  @ApiProperty()
  @IsString()
  @MaxLength(80)
  name!: string;

  @ApiProperty()
  @IsString()
  @MaxLength(30)
  grade!: string;

  @ApiProperty({ example: 2026 })
  @Type(() => Number)
  @IsInt()
  @Min(2020)
  @Max(2100)
  academicYear!: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  gradeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  institutionId?: string;
}

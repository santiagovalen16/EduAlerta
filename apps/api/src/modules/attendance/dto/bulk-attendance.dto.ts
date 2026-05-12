import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { ArrayMinSize, ValidateNested } from "class-validator";
import { UpsertAttendanceDto } from "./upsert-attendance.dto";

export class BulkAttendanceDto {
  @ApiProperty({ type: [UpsertAttendanceDto] })
  @ValidateNested({ each: true })
  @Type(() => UpsertAttendanceDto)
  @ArrayMinSize(1)
  records!: UpsertAttendanceDto[];
}

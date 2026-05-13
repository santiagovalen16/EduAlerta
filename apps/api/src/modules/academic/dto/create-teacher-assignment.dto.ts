import { ApiProperty } from "@nestjs/swagger";
import { IsUUID } from "class-validator";

export class CreateTeacherAssignmentDto {
  @ApiProperty()
  @IsUUID()
  teacherId!: string;

  @ApiProperty()
  @IsUUID()
  courseId!: string;

  @ApiProperty()
  @IsUUID()
  subjectId!: string;
}

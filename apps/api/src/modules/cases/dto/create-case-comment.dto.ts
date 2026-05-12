import { ApiProperty } from "@nestjs/swagger";
import { IsString, MinLength } from "class-validator";

export class CreateCaseCommentDto {
  @ApiProperty()
  @IsString()
  @MinLength(2)
  body!: string;
}

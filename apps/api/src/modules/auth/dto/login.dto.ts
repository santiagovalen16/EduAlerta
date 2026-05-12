import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEmail, IsOptional, IsString, MinLength } from "class-validator";

export class LoginDto {
  @ApiProperty({ example: "directivo@edualerta.gov.co" })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: "ChangeMe123!" })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  remember?: boolean;
}

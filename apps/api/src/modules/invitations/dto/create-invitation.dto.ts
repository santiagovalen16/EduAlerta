import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { RoleKey } from "@prisma/client";
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, IsUUID, Max, Min } from "class-validator";

export class CreateInvitationDto {
  @ApiProperty()
  @IsEmail()
  email!: string;

  @ApiProperty({ enum: RoleKey })
  @IsEnum(RoleKey)
  roleKey!: RoleKey;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  institutionId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ default: 7, minimum: 1, maximum: 30 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  expiresInDays?: number;
}

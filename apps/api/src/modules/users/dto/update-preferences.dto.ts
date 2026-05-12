import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsIn, IsOptional } from "class-validator";

export class UpdatePreferencesDto {
  @ApiPropertyOptional({ enum: ["es", "en"] })
  @IsOptional()
  @IsIn(["es", "en"])
  language?: "es" | "en";

  @ApiPropertyOptional({ enum: ["system", "light", "dark"] })
  @IsOptional()
  @IsIn(["system", "light", "dark"])
  theme?: "system" | "light" | "dark";

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  reducedMotion?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  highContrast?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  emailNotifications?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  alertNotifications?: boolean;

  @ApiPropertyOptional({ enum: ["daily", "weekly", "disabled"] })
  @IsOptional()
  @IsIn(["daily", "weekly", "disabled"])
  digestFrequency?: "daily" | "weekly" | "disabled";
}

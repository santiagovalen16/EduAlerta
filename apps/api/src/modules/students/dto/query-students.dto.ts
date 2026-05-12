import { RiskLevel } from "@prisma/client";
import { IsEnum, IsOptional } from "class-validator";
import { PaginationQueryDto } from "../../../common/dto/pagination-query.dto";

export class QueryStudentsDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(RiskLevel)
  riskLevel?: RiskLevel;
}

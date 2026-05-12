import { Controller, Post, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { RulesService } from "./rules.service";

@ApiTags("rules")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("rules")
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @Post("evaluate")
  @Permissions("rule:evaluate")
  evaluate() {
    return this.rulesService.evaluateAll();
  }
}

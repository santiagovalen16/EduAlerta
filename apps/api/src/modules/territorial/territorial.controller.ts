import { Controller, Get, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { TerritorialService } from "./territorial.service";

@ApiTags("territorial")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("territorial")
export class TerritorialController {
  constructor(private readonly territorialService: TerritorialService) {}

  @Get("overview")
  @Permissions("dashboard:territory:read")
  overview() {
    return this.territorialService.overview();
  }
}

import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { CasesService } from "./cases.service";
import { CreateCaseCommentDto } from "./dto/create-case-comment.dto";
import { CreateCaseDto } from "./dto/create-case.dto";
import { QueryCasesDto } from "./dto/query-cases.dto";
import { UpdateCaseDto } from "./dto/update-case.dto";

@ApiTags("cases")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("cases")
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  @Permissions("case:read")
  findMany(@Query() query: QueryCasesDto, @CurrentUser() user: CurrentUserPayload) {
    return this.casesService.findMany(query, user);
  }

  @Get(":id")
  @Permissions("case:read")
  findById(@Param("id") id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.casesService.findById(id, user);
  }

  @Get(":id/timeline")
  @Permissions("case:read")
  timeline(@Param("id") id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.casesService.timeline(id, user);
  }

  @Post()
  @Permissions("case:create")
  create(@Body() dto: CreateCaseDto, @CurrentUser() user: CurrentUserPayload) {
    return this.casesService.create(dto, user);
  }

  @Patch(":id")
  @Permissions("case:update")
  update(@Param("id") id: string, @Body() dto: UpdateCaseDto, @CurrentUser() user: CurrentUserPayload) {
    return this.casesService.update(id, dto, user);
  }

  @Post(":id/comments")
  @Permissions("case:update")
  comment(@Param("id") id: string, @Body() dto: CreateCaseCommentDto, @CurrentUser() user: CurrentUserPayload) {
    return this.casesService.comment(id, dto, user);
  }

  @Delete(":id")
  @Permissions("case:update")
  remove(@Param("id") id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.casesService.remove(id, user);
  }

  @Post(":id/acknowledge")
  @Permissions("case:read")
  acknowledge(@Param("id") id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.casesService.acknowledge(id, user);
  }
}

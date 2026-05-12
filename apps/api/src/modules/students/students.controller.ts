import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { CreateStudentDto } from "./dto/create-student.dto";
import { QueryStudentsDto } from "./dto/query-students.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { StudentsService } from "./students.service";

@ApiTags("students")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("students")
export class StudentsController {
  constructor(private readonly studentsService: StudentsService) {}

  @Get()
  @Permissions("student:read")
  findMany(@Query() query: QueryStudentsDto) {
    return this.studentsService.findMany(query);
  }

  @Get("risk")
  @Permissions("student:read")
  findAtRisk() {
    return this.studentsService.findAtRisk();
  }

  @Get(":id")
  @Permissions("student:read")
  findById(@Param("id") id: string) {
    return this.studentsService.findById(id);
  }

  @Post()
  @Permissions("student:create")
  create(@Body() dto: CreateStudentDto, @CurrentUser() user: CurrentUserPayload) {
    return this.studentsService.create(dto, user);
  }

  @Patch(":id")
  @Permissions("student:update")
  update(@Param("id") id: string, @Body() dto: UpdateStudentDto, @CurrentUser() user: CurrentUserPayload) {
    return this.studentsService.update(id, dto, user);
  }

  @Delete(":id")
  @Permissions("student:delete")
  remove(@Param("id") id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.studentsService.remove(id, user);
  }
}

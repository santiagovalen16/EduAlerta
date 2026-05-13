import { Body, Controller, Get, Post, Query, UseGuards } from "@nestjs/common";
import { ApiBearerAuth, ApiTags } from "@nestjs/swagger";
import { CurrentUser, CurrentUserPayload } from "../../common/decorators/current-user.decorator";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { JwtAuthGuard } from "../../common/guards/jwt-auth.guard";
import { PermissionsGuard } from "../../common/guards/permissions.guard";
import { AcademicService } from "./academic.service";
import { CreateCourseDto } from "./dto/create-course.dto";
import { CreateSubjectDto } from "./dto/create-subject.dto";
import { CreateTeacherAssignmentDto } from "./dto/create-teacher-assignment.dto";
import { QueryAcademicDto } from "./dto/query-academic.dto";

@ApiTags("academic")
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller("academic")
export class AcademicController {
  constructor(private readonly academicService: AcademicService) {}

  @Get("subjects")
  @Permissions("academic:read")
  subjects(@Query() query: QueryAcademicDto, @CurrentUser() user: CurrentUserPayload) {
    return this.academicService.subjects(query, user);
  }

  @Post("subjects")
  @Permissions("academic:write")
  createSubject(@Body() dto: CreateSubjectDto, @CurrentUser() user: CurrentUserPayload) {
    return this.academicService.createSubject(dto, user);
  }

  @Get("courses")
  @Permissions("academic:read")
  courses(@Query() query: QueryAcademicDto, @CurrentUser() user: CurrentUserPayload) {
    return this.academicService.courses(query, user);
  }

  @Post("courses")
  @Permissions("academic:write")
  createCourse(@Body() dto: CreateCourseDto, @CurrentUser() user: CurrentUserPayload) {
    return this.academicService.createCourse(dto, user);
  }

  @Get("assignments")
  @Permissions("academic:read")
  assignments(@Query() query: QueryAcademicDto, @CurrentUser() user: CurrentUserPayload) {
    return this.academicService.assignments(query, user);
  }

  @Post("assignments")
  @Permissions("academic:write")
  createAssignment(@Body() dto: CreateTeacherAssignmentDto, @CurrentUser() user: CurrentUserPayload) {
    return this.academicService.createAssignment(dto, user);
  }
}

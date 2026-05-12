import { createParamDecorator, ExecutionContext } from "@nestjs/common";

export type CurrentUserPayload = {
  sub: string;
  email: string;
  role: string;
  permissions: string[];
  sessionId?: string;
};

export const CurrentUser = createParamDecorator((_data: unknown, context: ExecutionContext): CurrentUserPayload => {
  const request = context.switchToHttp().getRequest<{ user: CurrentUserPayload }>();
  return request.user;
});

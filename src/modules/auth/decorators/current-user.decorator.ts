import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { UserEntity } from 'src/modules/users/model/user.entity';
import { ExtractJwt } from 'passport-jwt';

export const CurrentUser = createParamDecorator<UserEntity>(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const CurrentToken = createParamDecorator<UserEntity>(
  (data: unknown, context: ExecutionContext) => {
    const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(
      context.switchToHttp().getRequest()
    );
    return accessToken;
  }
)

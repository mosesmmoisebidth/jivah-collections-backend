import { Reflector } from '@nestjs/core';
import { Injectable, ExecutionContext } from '@nestjs/common';
import { ExtractJwt } from 'passport-jwt';
import { IS_PUBLIC } from 'src/constants';
import { TokensService } from 'src/modules/tokens/token.service';
import { InternalServerErrorCustomException } from 'src/common/http';
import { UnauthorizedCustomException } from 'src/common/http/exceptions/unauthorized.exception';
import { AuthGuard } from '@nestjs/passport';
import { Request } from 'express';
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    private tokenService: TokensService,
    private reflector: Reflector,
  ) {
    super();
  }

  /**
   * Verify the token is valid
   * @param context {ExecutionContext}
   * @returns super.canActivate(context)
   */
  async canActivate(context: ExecutionContext): Promise<any> {
    try {
      const request = context.switchToHttp().getRequest<Request>();
      const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC, [
        context.getHandler(),
        context.getClass(),
      ]);

      if (isPublic) {
        return true;
      }
      let accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(
        context.switchToHttp().getRequest(),
      );
      if(!accessToken){
        accessToken = request.cookies['accessToken'];
      }
      if (!accessToken) throw new UnauthorizedCustomException('Not logged in!');
      const payload = await this.tokenService.verifyAccessToken(accessToken);
      request.user = payload;
      return true;
    } catch (error) {
      if (error.name !== 'Error') throw error;
      throw new InternalServerErrorCustomException();
    }
  }

  /**
   * Handle request and verify if exist an error or there's not user
   * @param error
   * @param user
   * @returns user || error
   */
  handleRequest(error, user) {
    if (error || !user) throw new UnauthorizedCustomException();
    return user;
  }
}

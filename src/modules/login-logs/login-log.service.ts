import {
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  RequestTimeoutException,
  Scope,
} from '@nestjs/common';
import { UAParser } from 'ua-parser-js';
import { LoginLogEntity } from './model/login-log.entity';
import { PaginationRequest } from 'src/helpers/pagination';
import { handlePaginate } from 'src/helpers/pagination/pagination.helper';
import { TimeoutError } from 'rxjs';
import { getLocation } from 'src/utils/ip.util';
import { UserEntity } from '../users/model/user.entity';
import { UserRequest } from 'src/types/request';
import { LoginLogDto } from './dto/login-log.dto';
import { ResponseService } from 'src/shared/response/response.service';
import { ResponseDto } from 'src/common/dtos';
import { REQUEST } from '@nestjs/core';
import { LoginLogRepository } from './model/login-log.repository';
import { PaginationResponseDto } from 'src/helpers/pagination/pagination-response.dto';

@Injectable({ scope: Scope.REQUEST })
export class LoginLogService {
  constructor(
    @Inject(REQUEST) private req: UserRequest,
    private loginLogRepository: LoginLogRepository,
    private responseService: ResponseService,
  ) {}

  public async create(
    user: UserEntity,
    ip: string,
    ua: string,
  ): Promise<LoginLogEntity> {
    const location = getLocation(ip);

    const createdLoginLog = await this.loginLogRepository.save({
      ip,
      ua,
      address: location.country,
      user,
    });

    return createdLoginLog;
  }

  parseLoginLog(e: LoginLogEntity): LoginLogDto {
    const parser = new UAParser();

    const uaResult = parser.setUA(e.ua).getResult();

    const data = {
      id: e.id,
      ip: e.ip,
      address: e.address,
      os: `${`${uaResult.os.name ?? ''} `}${uaResult.os.version}`,
      browser: `${`${uaResult.browser.name ?? ''} `}${uaResult.browser.version}`,
      username: e?.user?.username,
      time: e.createdAt,
    };

    return data;
  }

  public async getLoginLogs(
    pagination: PaginationRequest,
  ): Promise<ResponseDto<PaginationResponseDto<LoginLogDto>>> {
    try {
      const user = this.req.user;

      const loginLogs = await handlePaginate(
        this.loginLogRepository,
        pagination,
        {
          order: pagination.order,
          relations: ['user'],
          where: [{ userId: user.id }],
        },
      );

      loginLogs.items = loginLogs.items.map((item: LoginLogEntity) =>
        this.parseLoginLog(item),
      );

      return this.responseService.makeResponse({
        message: 'Login logs fetched successfully',
        payload: loginLogs,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException();
      }
      if (error instanceof TimeoutError) {
        throw new RequestTimeoutException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  public getDeviceOsName(ua: string) {
    const parser = new UAParser();

    const uaResult = parser.setUA(ua).getResult();

    return uaResult.os.name ?? '';
  }
}

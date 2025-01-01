import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiOkPaginatedResponse, PaginationParams, PaginationRequest } from 'src/helpers/pagination';
import { LoginLogService } from './login-log.service';
import { TOKEN_NAME } from 'src/constants';
import { ResponseDto } from 'src/common/dtos';
import { ApiInternalServerErrorCustomResponse } from 'src/common/decorators/api-ise-custom-response.decorator';
import { NullDto } from 'src/common/dtos/null.dto';
import { ApiBadRequestCustomResponse } from 'src/common/decorators/api-bad-request-custom-response.decorator';
import { ApiUnauthorizedCustomResponse } from 'src/common/decorators/api-unauthorized-custom-response.decorator';
import { LoginLogDto } from './dto/login-log.dto';
import { PaginationResponseDto } from 'src/helpers/pagination/pagination-response.dto';

@ApiTags('Login Logs')
@Controller({
  path: 'login-logs',
  version: '1',
})
@ApiBearerAuth(TOKEN_NAME)
@ApiInternalServerErrorCustomResponse(NullDto)
@ApiInternalServerErrorCustomResponse(NullDto)
@ApiBadRequestCustomResponse(NullDto)
@ApiUnauthorizedCustomResponse(NullDto)
export class LoginLogController {
  constructor(private loginLogService: LoginLogService) {}

  @ApiOperation({ description: 'Get a paginated login logs list' })
  @ApiOkPaginatedResponse(LoginLogDto)
  @Get()
  public getLoginLogs(
    @PaginationParams() pagination: PaginationRequest,
  ): Promise<ResponseDto<PaginationResponseDto<LoginLogDto>>> {
    return this.loginLogService.getLoginLogs(pagination);
  }
}

import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApiInternalServerErrorCustomResponse } from 'src/common/decorators/api-ise-custom-response.decorator';
import { ApiOkCustomResponse } from 'src/common/decorators';
import { HealthService } from './health.service';
import { ResponseDto } from 'src/common/dtos';
import { NullDto } from 'src/common/dtos/null.dto';

@ApiTags('Health')
@Controller({ path: '/health', version: '1' })
@ApiInternalServerErrorCustomResponse(NullDto)
export class HealthController {
    constructor(
        private readonly healthService: HealthService
    ){}
    @Get()
    @ApiOperation({ description: 'Health Test' })
    @ApiOkCustomResponse(NullDto)
    @HttpCode(HttpStatus.OK)
    getHealth(): ResponseDto<null> {
        return this.healthService.getHealth();
    }
}
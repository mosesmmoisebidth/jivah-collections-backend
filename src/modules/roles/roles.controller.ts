import {
  ValidationPipe,
  Controller,
  Param,
  Body,
  Get,
  Put,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiOkPaginatedResponse, PaginationParams, PaginationRequest } from 'src/helpers/pagination';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import {
  UpdateRoleRequestDto,
  RoleResponseDto,
} from './dtos';
import { PaginationResponseDto } from 'src/helpers/pagination/pagination-response.dto';
import { RolesService } from './roles.service';
import { TOKEN_NAME } from 'src/constants';
import { ApiOkCustomResponse } from 'src/common/decorators';
import { ApiInternalServerErrorCustomResponse } from 'src/common/decorators/api-ise-custom-response.decorator';
import { NullDto } from 'src/common/dtos/null.dto';
import { ApiBadRequestCustomResponse } from 'src/common/decorators/api-bad-request-custom-response.decorator';
import { ApiUnauthorizedCustomResponse } from 'src/common/decorators/api-unauthorized-custom-response.decorator';
import { ApiForbiddenCustomResponse } from 'src/common/decorators/api-forbidden-custom-response.decorator';
import { RoleDto } from './dtos/role-dto';
import { ResponseDto } from 'src/common/dtos';

@ApiTags('Roles')
@ApiBearerAuth(TOKEN_NAME)
@ApiInternalServerErrorCustomResponse(NullDto)
@ApiBadRequestCustomResponse(NullDto)
@ApiUnauthorizedCustomResponse(NullDto)
@ApiForbiddenCustomResponse(NullDto)
@Controller({
  path: 'roles',
  version: '1',
})
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @ApiOperation({ description: 'Get a paginated roles list' })
  @ApiOkPaginatedResponse(RoleDto)
  @ApiQuery({
    name: 'search',
    type: 'enum',
    required: false,
  })
  @ApiQuery({
    name: 'permissions',
    type: 'boolean',
    required: false,
  })
  // @Permissions('read.roles')
  @Get()
  public getRoles(
    @PaginationParams() pagination: PaginationRequest,
  ): Promise<ResponseDto<PaginationResponseDto<RoleDto>>> {
    return this.rolesService.getRoles(pagination);
  }

  @ApiOperation({ description: 'Get role by id' })
  @ApiOkCustomResponse(RoleResponseDto)
  // @Permissions('read.roles')
  @Get('/:id')
  public getRoleById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseDto<RoleResponseDto>> {
    return this.rolesService.getRoleById(id);
  }

  @ApiOperation({ description: 'Update role by id' })
  @ApiOkCustomResponse(RoleResponseDto)
  // @Permissions('update.roles')
  @Put('/:id')
  public updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) roleDto: UpdateRoleRequestDto,
  ): Promise<ResponseDto<RoleResponseDto>> {
    return this.rolesService.updateRole(id, roleDto);
  }
}

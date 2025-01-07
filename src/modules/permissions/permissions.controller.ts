import {
  ValidationPipe,
  Controller,
  Param,
  Body,
  Get,
  Post,
  Put,
  ParseUUIDPipe,
} from '@nestjs/common';
import { ApiOkPaginatedResponse, PaginationParams, PaginationRequest } from 'src/helpers/pagination';
import {
  CreatePermissionRequestDto,
  UpdatePermissionRequestDto,
  PermissionResponseDto,
} from './dtos';
import {
  ApiConflictResponse,
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { PermissionsService } from './permissions.service';
import { PaginationResponseDto } from 'src/helpers/pagination/pagination-response.dto';
import { TOKEN_NAME } from 'src/constants';
import { ApiInternalServerErrorCustomResponse } from 'src/common/decorators/api-ise-custom-response.decorator';
import { NullDto } from 'src/common/dtos/null.dto';
import { PermissionDto } from './dtos/permission-dto';
import { ResponseDto } from 'src/common/dtos';
import { ApiCreatedCustomResponse, ApiOkCustomResponse } from 'src/common/decorators';

@ApiTags('Permissions')
@Controller({
  path: 'permissions',
  version: '1',
})
@ApiInternalServerErrorCustomResponse(NullDto)
@ApiBearerAuth(TOKEN_NAME)
export class PermissionsController {
  constructor(private permissionsService: PermissionsService) {}

  @ApiOperation({ description: 'Get a paginated permissions list' })
  @ApiOkPaginatedResponse(PermissionDto)
  @ApiQuery({
    name: 'search',
    type: 'string',
    required: false,
  })
  // @Permissions('read.permissions')
  @Get()
  public getPermissions(
    @PaginationParams() pagination: PaginationRequest,
  ): Promise<ResponseDto<PaginationResponseDto<PermissionDto>>> {
    return this.permissionsService.getPermissions(pagination);
  }

  @ApiOperation({ description: 'Get permission by id' })
  @ApiOkCustomResponse(PermissionResponseDto)
  // @Permissions('read.permissions')
  @Get('/:id')
  public getPermissionById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<ResponseDto<PermissionResponseDto>> {
    return this.permissionsService.getPermissionById(id);
  }

  @ApiOperation({ description: 'Create new permission' })
  @ApiCreatedCustomResponse(PermissionResponseDto)
  @ApiConflictResponse({ description: 'Permission already exists' })
  // @Permissions('create.permissions')
  @Post()
  public createPermission(
    @Body(ValidationPipe) permissionDto: CreatePermissionRequestDto,
  ): Promise<ResponseDto<PermissionResponseDto>> {
    return this.permissionsService.createPermission(permissionDto);
  }

  @ApiOperation({ description: 'Update permission by id' })
  @ApiOkCustomResponse(PermissionResponseDto)
  @ApiConflictResponse({ description: 'Permission already exists' })
  // @Permissions('update.permissions')
  @Put('/:id')
  public updatePermission(
    @Param('id', ParseUUIDPipe) id: string,
    @Body(ValidationPipe) permissionDto: UpdatePermissionRequestDto,
  ): Promise<ResponseDto<PermissionResponseDto>> {
    return this.permissionsService.updatePermission(id, permissionDto);
  }
}

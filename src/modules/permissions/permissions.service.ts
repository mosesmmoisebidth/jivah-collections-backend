import {
  InternalServerErrorException,
  RequestTimeoutException,
  NotFoundException,
  Injectable,
} from '@nestjs/common';
import {
  CreatePermissionRequestDto,
  UpdatePermissionRequestDto,
  PermissionResponseDto,
} from './dtos';
import { PaginationRequest } from 'src/helpers/pagination';
import { PermissionMapper } from './permission.mapper';
import { DBErrorCode } from 'src/common/enums';
import { TimeoutError } from 'rxjs';
import { PaginationResponseDto } from 'src/helpers/pagination/pagination-response.dto';
import { handlePaginate } from 'src/helpers/pagination/pagination.helper';
import { PermissionRepository } from './model/permission.repository';
import { ILike } from 'typeorm';
import { ConflictCustomException } from 'src/common/http';
import { PermissionDto } from './dtos/permission-dto';
import { ResponseDto } from 'src/common/dtos';
import { ResponseService } from 'src/shared/response/response.service';

@Injectable()
export class PermissionsService {
  constructor(
    private permissionsRepository: PermissionRepository,
    private responseService: ResponseService,
  ) {}

  /**
   * List of permissions
   * @param pagination
   * @returns {ResponseDto<PaginationResponseDto<PermissionDto>>}
   */
  public async getPermissions(
    pagination: PaginationRequest,
  ): Promise<ResponseDto<PaginationResponseDto<PermissionDto>>> {
    try {
      const search = pagination.params?.search ?? '';
      const permissions = await handlePaginate(
        this.permissionsRepository,
        pagination,
        {
          order: pagination.order,
          where: [
            {
              slug: ILike(`%${search}%`),
            },
          ],
        },
      );

      permissions.items = await Promise.all(
        permissions.items.map(PermissionMapper.toDto),
      );

      return this.responseService.makeResponse({
        message: 'Permissions retreived successfully',
        payload: permissions,
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

  /**
   * Get permission by id
   * @param id {number}
   * @returns {Promise<PermissionDto>}
   */
  public async getPermissionById(
    id: string,
  ): Promise<ResponseDto<PermissionResponseDto>> {
    const permissionEntity = await this.permissionsRepository.findOneBy({ id });
    if (!permissionEntity) {
      throw new NotFoundException();
    }

    return this.responseService.makeResponse({
      message: 'Permission retrieved',
      payload: {
        permission: PermissionMapper.toDto(permissionEntity),
      },
    });
  }

  /**
   * Create new permission
   * @param permissionDto {CreatePermissionRequestDto}
   * @returns {Promise<PermissionDto>}
   */
  public async createPermission(
    permissionDto: CreatePermissionRequestDto,
  ): Promise<ResponseDto<PermissionResponseDto>> {
    try {
      let permissionEntity = PermissionMapper.toCreateEntity(permissionDto);
      permissionEntity =
        await this.permissionsRepository.save(permissionEntity);
      return this.responseService.makeResponse({
        message: 'Permission created successfully',
        payload: { permission: PermissionMapper.toDto(permissionEntity) },
      });
    } catch (error) {
      if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
        throw new ConflictCustomException('Permission Already Exist');
      }
      if (error instanceof TimeoutError) {
        throw new RequestTimeoutException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  /**
   * Update permission by id
   * @param id {number}
   * @param permissionDto {UpdatePermissionRequestDto}
   * @returns {Promise<PermissionResponseDto>}
   */
  public async updatePermission(
    id: string,
    permissionDto: UpdatePermissionRequestDto,
  ): Promise<ResponseDto<PermissionResponseDto>> {
    let permissionEntity = await this.permissionsRepository.findOneBy({ id });
    if (!permissionEntity) {
      throw new NotFoundException();
    }

    try {
      permissionEntity = PermissionMapper.toUpdateEntity(
        permissionEntity,
        permissionDto,
      );
      permissionEntity =
        await this.permissionsRepository.save(permissionEntity);
      return this.responseService.makeResponse({
        message: 'Updated permission successfully',
        payload: {
          permission: PermissionMapper.toDto(permissionEntity),
        },
      });
    } catch (error) {
      if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
        throw new ConflictCustomException('Permission Already Exist');
      }
      if (error instanceof TimeoutError) {
        throw new RequestTimeoutException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }
}

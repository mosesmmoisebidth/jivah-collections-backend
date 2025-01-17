import {
  InternalServerErrorException,
  RequestTimeoutException,
  NotFoundException,
  Injectable,
  Scope,
} from '@nestjs/common';
import { PaginationRequest } from 'src/helpers/pagination';
import { UpdateRoleRequestDto, RoleResponseDto } from './dtos';
import { DBErrorCode } from 'src/common/enums';
import { RoleMapper } from './role.mapper';
import { TimeoutError } from 'rxjs';
import { handlePaginate } from 'src/helpers/pagination/pagination.helper';
import { PaginationResponseDto } from 'src/helpers/pagination/pagination-response.dto';
import { RoleRepository } from './model/role.repository';
import { ILike, In } from 'typeorm';
import { RemovePermissionsFromRoleRequestDto } from './dtos/remove-permissions-request.dto';
import { BadRequestCustomException, ConflictCustomException } from 'src/common/http';
import { ResponseDto } from 'src/common/dtos';
import { RoleStatus } from './enums/role-status.enum';
import { ResponseService } from 'src/shared/response/response.service';
import { RoleDto } from './dtos/role-dto';
import { CustomException } from 'src/common/http/exceptions/custom.exception';
import { isTrueOrFalse } from 'src/utils/boolean.util';
import { AddPermissionsToRoleRequestDto } from './dtos/add-permissions-request.dto';
import { RoleEntity } from './model/role.entity';
import { PermissionRepository } from '../permissions/model/permission.repository';
import { FindOperator } from 'typeorm';
import { ERoleType } from './enums/role.enum';
@Injectable({ scope: Scope.REQUEST })
export class RolesService {
  constructor(
    private rolesRepository: RoleRepository,
    private responseService: ResponseService,
    private permissionRepository: PermissionRepository
  ) {}

  /**
   * List of roles
   * @param pagination
   * @returns {ResponseDto<PaginationResponseDto<RoleResponseDto>>}
   */
  public async getRoles(
    pagination: PaginationRequest,
  ): Promise<ResponseDto<PaginationResponseDto<RoleDto>>> {
    try {
      const search = pagination.params?.search ?? '';
      const permissions = isTrueOrFalse(pagination.params?.permissions ?? '');

      const roles = await handlePaginate(this.rolesRepository, pagination, {
        order: pagination.order,
        where: [
          {
            name: ILike(`%${search}%`) as FindOperator<ERoleType>,
          },
        ],
      });

      roles.items = await Promise.all(
        roles.items.map((role: RoleEntity) =>
          RoleMapper.toDto(role, { permissions }),
        ),
      );

      return this.responseService.makeResponse({
        message: 'Roles retrieved successfully',
        payload: roles,
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
   * Get role by id
   * @param id {number}
   * @returns {Promise<ResponseDto<RoleResponseDto>>}
   */
  public async getRoleById(id: string): Promise<ResponseDto<RoleResponseDto>> {
    const roleEntity = await this.rolesRepository.findOneBy({ id });
    if (!roleEntity) {
      throw new NotFoundException();
    }
    const role = await RoleMapper.toDto(roleEntity, { permissions: false });
    return this.responseService.makeResponse({
      message: 'Retrieved role by id',
      payload: { role },
    });
  }

  /**
   * Update role by id
   * @param id {number}
   * @param roleDto {UpdateRoleRequestDto}
   * @returns {Promise<RoleResponseDto>}
   */
  public async updateRole(
    id: string,
    roleDto: UpdateRoleRequestDto,
  ): Promise<ResponseDto<RoleResponseDto>> {
    let roleEntity = await this.rolesRepository.findOneBy({ id });
    if (!roleEntity) {
      throw new NotFoundException();
    }
    try {
      roleEntity = RoleMapper.toUpdateEntity(roleEntity, roleDto);
      await this.rolesRepository.save(roleEntity);
      const updatedRoleEntity = await this.rolesRepository.findOneBy({ id });
      const role = await RoleMapper.toDto(updatedRoleEntity, {
        permissions: true,
      });
      return this.responseService.makeResponse({
        message: 'Role updated successfully',
        payload: { role },
      });
    } catch (error) {
      if (error.code == DBErrorCode.PgUniqueConstraintViolation) {
        throw new ConflictCustomException('Role Already Exist');
      }
      if (
        error.code == DBErrorCode.PgForeignKeyConstraintViolation ||
        error.code == DBErrorCode.PgNotNullConstraintViolation
      ) {
        throw new BadRequestCustomException('Foreign Key Constraint');
      }
      if (error instanceof TimeoutError) {
        throw new RequestTimeoutException();
      } else {
        throw new InternalServerErrorException();
      }
    }
  }

  public async addPermissions(
    id: string,
    addPermissionDto: AddPermissionsToRoleRequestDto,
 ): Promise<ResponseDto<RoleResponseDto>> {
    const roleEntity = await this.rolesRepository.findOneBy({
       id,
       status: In([RoleStatus.Active, RoleStatus.Inactive])
    });
    if (!roleEntity) throw new NotFoundException();
    try {
       await RoleMapper.addPermissions(roleEntity, addPermissionDto.permissions);
       const updatedRoleEntity = await this.rolesRepository.findOneBy({ id });
       const role = await RoleMapper.toDto(updatedRoleEntity, {
          permissions: true
       });
       return this.responseService.makeResponse({
          message: "Role updated successfully",
          payload: { role }
       });
    } catch (error) {
       throw new CustomException(error);
    }
 }

 public async removePermissions(
  id: string,
  removePermissionDto: RemovePermissionsFromRoleRequestDto
): Promise<ResponseDto<RoleResponseDto>> {
  const permissionsExist = await this.permissionRepository.findBy({
     id: In(removePermissionDto.permissions),
     status: In([RoleStatus.Active, RoleStatus.Inactive])
  });
  if (permissionsExist.length === 0) {
     throw new NotFoundException(
        `Permissions trying to be deleted are not found on the role ${id}`
     );
  }
  const roleEntity = await this.rolesRepository.findOneBy({
     id
  });
  if (!roleEntity) throw new NotFoundException();
  try {
     await RoleMapper.removePermissions(roleEntity, removePermissionDto.permissions);
     const updatedRoleEntity = await this.rolesRepository.findOneBy({ id });
     const role = await RoleMapper.toDto(updatedRoleEntity, {
        permissions: true
     });
     return this.responseService.makeResponse({
        message: "Role updated successfully",
        payload: { role }
     });
  } catch (error) {
     throw new CustomException(error);
  }
}


}

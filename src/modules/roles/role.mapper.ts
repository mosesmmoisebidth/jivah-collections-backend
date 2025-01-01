import { PermissionEntity } from '../permissions/model/permission.entity';
import { PermissionMapper } from '../permissions/permission.mapper';
import { CreateRoleRequestDto, UpdateRoleRequestDto } from './dtos';
import { RoleDto } from './dtos/role-dto';
import { RoleEntity } from './model/role.entity';

type DtoPopulation = {
  permissions?: boolean;
};

export class RoleMapper {
  public static async toDto(
    entity: RoleEntity,
    population: DtoPopulation = { permissions: false },
  ): Promise<RoleDto> {
    const { permissions } = population;
    const dto = new RoleDto();
    dto.id = entity.id;
    dto.name = entity.name;
    dto.active = entity.active;
    if (permissions)
      dto.permissions = await Promise.all(
        (await entity.permissions).map(PermissionMapper.toDto),
      );
    dto.createdAt = entity.createdAt;
    dto.updatedAt = entity.updatedAt;
    return dto;
  }

  public static toCreateEntity(dto: CreateRoleRequestDto): RoleEntity {
    const entity = new RoleEntity();
    entity.name = dto.name;
    entity.permissions = Promise.resolve(
      dto.permissions.map((id) => new PermissionEntity({ id })),
    );
    entity.active = true;
    return entity;
  }

  public static toUpdateEntity(
    entity: RoleEntity,
    dto: UpdateRoleRequestDto,
  ): RoleEntity {
    entity.name = dto.name;
    entity.permissions = Promise.resolve(
      dto.permissions.map((id) => new PermissionEntity({ id })),
    );
    entity.active = dto.active;
    return entity;
  }

  public static async addPermissions(
    entity: RoleEntity,
    permissionIds: string[],
  ): Promise<RoleEntity> {
    const roleEntityWithRelations = await RoleMapper.toDto(entity, {
      permissions: true,
    });
    const currentPermissions = roleEntityWithRelations.permissions.map(
      (permission) => permission.id,
    );
    const mergedPermissions = Array.from(
      new Set(currentPermissions.concat(permissionIds)),
    );
    entity.permissions = Promise.resolve(
      mergedPermissions.map((id) => new PermissionEntity({ id })),
    );
    await entity.save();
    return entity;
  }

  public static async removePermissions(
    entity: RoleEntity,
    permissionIds: string[],
  ): Promise<RoleEntity> {
    const roleEntityWithRelations = await RoleMapper.toDto(entity, {
      permissions: true,
    });
    const currentPermissions = roleEntityWithRelations.permissions.map(
      (permission) => permission.id,
    );
    const filteredPermissions = currentPermissions.filter(
      (permission) => !permissionIds.includes(permission),
    );
    entity.permissions = Promise.resolve(
      filteredPermissions.map((id) => new PermissionEntity({ id })),
    );
    await entity.save();
    return entity;
  }
}

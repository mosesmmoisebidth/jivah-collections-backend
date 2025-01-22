import { PermissionEntity } from '../permissions/model/permission.entity';
import { PermissionMapper } from '../permissions/permission.mapper';
import { RoleEntity } from '../roles/model/role.entity';
import { RoleMapper } from '../roles/role.mapper';
import { UserDto } from './dto/user-dto';
import { CreateUserRequestDto } from './dto';
import { UpdateUserDto } from './dto';
import { UserEntity } from './model/users.entity';

type DtoPopulation = {
  roles?: boolean;
  role?: boolean;
  permissions?: boolean;
};

export class UserMapper {

    public static isValidValue(value: any): boolean {
        return value !== undefined && value !== null && value !== 'string;'
    }
    public static async toDtoPermRoles(
        entity: UserEntity,
        population: DtoPopulation = { roles: false, permissions: false }
    ): Promise<UserDto> {
        const { roles, permissions } = population;
        const dto = new UserDto();
        const dtoKeys = new Set(['permissions', 'roles'])
        const entityKeys = new Set([
          'id', 'username',
          'firstName', 'lastName',
          'email', 'status', 'profilePhoto',
          'createdAt', 'updatedAt', 'role'
        ])
        for(const key in entity){
            if(!dtoKeys.has(key) && entityKeys.has(key)){
                dto[key] = entity[key];
            }else{
                if(permissions){
                  if(!entity.permissions){
                    entity.permissions = Promise.resolve([]);
                  }
                  console.log("this condition has been reached");
                    const permissions = (await entity.permissions).filter((permission) => permission.active === true);
                    if(permissions.length > 0){
                        dto.permissions = await Promise.all(
                            permissions.map(PermissionMapper.toDto)
                        )
                    }else{
                        dto.permissions = [];
                    }
                }
                if(roles){
                  if(!entity.roles){
                    entity.roles = Promise.resolve([]);
                  }
                  console.log("the condition has reached");
                    const roles = (await entity.roles).filter((role) => role.active === true);
                    console.log("the roles are: " + JSON.stringify(roles));
                    if(roles.length > 0){
                        dto.roles = await Promise.all(
                            roles.map((role) => RoleMapper.toDto(role, { permissions: permissions }))
                        )
                        console.log("the dto roles are: " + JSON.stringify(dto.roles));
                    }else{
                        dto.roles = [];
                    }
                }
            }
        }
        return dto;
    }

    public static toCreateEntity(
        dto: CreateUserRequestDto
    ): UserEntity {
        const dtoKeys = new Set(['permissions', 'roles']);
        const entity = new UserEntity();
        for(const key in dto){
            if(this.isValidValue(dto[key]) && !dtoKeys.has(key)){
                entity[key] = dto[key];
            }else{
                if(key === 'permissions'){
                    entity.permissions = Promise.resolve(
                        dto.permissions.map((id) => new PermissionEntity({ id }))
                    )
                }
                if(key === 'roles'){
                    entity.roles = Promise.resolve(
                        dto.roles.map((id) => new RoleEntity({ id }))
                    )
                }else{
                    continue;
                }
            }
        }
        return entity;
    }


  public static toUpdateEntity(
    entity: UserEntity,
    dto: UpdateUserDto
  ): UserEntity {
    for(const key in dto){
        if(this.isValidValue(dto[key])){
            entity[key] = dto[key];
        }
    }
    return entity;
  }

  public static async addPermissions(
    entity: UserEntity,
    permissionIds: string[],
  ): Promise<UserEntity> {
    const userEntityWithRelations = await UserMapper.toDtoPermRoles(entity, {
      roles: true,
      permissions: true,
    });
    const currentPermissions = userEntityWithRelations.permissions.map(
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
    entity: UserEntity,
    permissionIds: string[],
  ): Promise<UserEntity> {
    const userEntityWithRelations = await UserMapper.toDtoPermRoles(entity, {
      permissions: true,
      roles: true,
    });
    const currentPermissions = userEntityWithRelations.permissions.map(
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

  public static async addRoles(
    entity: UserEntity,
    roleIds: string[],
  ): Promise<UserEntity> {
    const userEntityWithRelations = await UserMapper.toDtoPermRoles(entity, {
      roles: true,
      permissions: true,
    });
    const currentRoles = userEntityWithRelations.roles.map((role) => role.id);
    const mergedRoles = Array.from(new Set(currentRoles.concat(roleIds)));
    entity.roles = Promise.resolve(
      mergedRoles.map((id) => new RoleEntity({ id })),
    );
    await entity.save();
    return entity;
  }

  public static async removeRoles(
    entity: UserEntity,
    roleIds: string[],
  ): Promise<UserEntity> {
    const roleEntityWithRelations = await UserMapper.toDtoPermRoles(entity, {
      roles: true,
      permissions: false,
    });
    const currentRoles = roleEntityWithRelations.roles.map((role) => role.id);
    const filteredRoles = currentRoles.filter(
      (role) => !roleIds.includes(role),
    );
    entity.roles = Promise.resolve(
      filteredRoles.map((id) => new RoleEntity({ id })),
    );
    await entity.save();
    return entity;
  }
}

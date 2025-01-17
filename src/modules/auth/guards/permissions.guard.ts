import { Reflector } from '@nestjs/core';
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { UserEntity } from 'src/modules/users/model/users.entity';
import { UserMapper } from 'src/modules/users/users.mapper';
import { PERMISSIONS } from 'src/constants';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  /**
   * Check if the user has permission to access the resource
   * @param context {ExecutionContext}
   * @returns{boolean}
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const permissions = this.reflector.get<string[]>(
      PERMISSIONS,
      context.getHandler(),
    );

    if (!permissions?.length) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    return this.matchPermissions(permissions, user);
  }

  /**
   * Verifies permissions match the user's permissions
   * @param permissions {string[]}
   * @param user {UserEntity}
   * @returns {boolean}
   */
  async matchPermissions(
    permissions: string[],
    user: UserEntity,
  ): Promise<boolean> {
    const userDto = await UserMapper.toDtoPermRoles(user, {
      permissions: true,
      roles: true,
    });
    console.log("the userDto is: " + JSON.stringify(userDto))
    const permissionDto = userDto.permissions || [];
    const roles = userDto.roles || []
    let allPermissions: string[] = permissionDto.map(({ slug }) => slug);
    roles.forEach(({ permissions }) => {
      console.log("the permissions here are: " + JSON.stringify(permissions));
      const rolePermissions = permissions.map(({ slug }) => slug);
      allPermissions = allPermissions.concat(rolePermissions);
      console.log("the permissions are here: " + JSON.stringify(allPermissions))
    });

    return permissions.some((permission) =>
      allPermissions?.includes(permission),
    );
  }
}
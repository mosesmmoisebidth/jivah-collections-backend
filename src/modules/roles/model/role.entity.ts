import { Entity, Column, ManyToMany, JoinTable } from 'typeorm';
import { PermissionEntity } from '../../permissions/model/permission.entity';
import { CommonEntity } from 'src/common/entities';
import { RoleStatus } from '../enums/role-status.enum';
import { UserEntity } from 'src/modules/users/model/users.entity';
import { ERoleType } from '../enums/role.enum';
@Entity({schema: "users", name: 'roles' })
export class RoleEntity extends CommonEntity {
  @Column({
    nullable: false,
    type: 'enum',
    enum: ERoleType,
    default: ERoleType.USER
  })
  name: ERoleType;

  @Column({
    type: 'boolean',
    nullable: false,
    default: true,
  })
  active: boolean;

  @Column({
    nullable: false,
    type: 'enum',
    enum: RoleStatus,
    default: RoleStatus.Active
  })
  status: RoleStatus;

  @ManyToMany(() => UserEntity, (user) => user.roles)
  users: UserEntity[];

  @ManyToMany(() => PermissionEntity, (permission) => permission.roles)
  @JoinTable({
    name: 'roles-permissions',
    joinColumn: {
      name: 'roleId',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permissionId',
      referencedColumnName: 'id',
    },
  })
  permissions: Promise<PermissionEntity[]>;
}

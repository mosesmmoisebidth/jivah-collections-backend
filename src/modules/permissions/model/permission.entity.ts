import { Entity, Column, ManyToMany } from 'typeorm';
import { CommonEntity } from 'src/common/entities';
import { RoleEntity } from '../../roles/model/role.entity';
import { UserEntity } from '../../users/model/user.entity';

@Entity({ schema: "users", name: 'permissions' })
export class PermissionEntity extends CommonEntity {
  @Column({
    name: 'slug',
    type: 'varchar',
    nullable: false,
    unique: true,
    length: 60,
  })
  slug: string;

  @Column({
    name: 'description',
    type: 'varchar',
    nullable: false,
    length: 160,
  })
  description: string;

  @Column({
    name: 'active',
    type: 'boolean',
    nullable: false,
    default: true,
  })
  active: boolean;

  @ManyToMany(() => RoleEntity, (role) => role.permissions)
  roles: RoleEntity[];

  @ManyToMany(() => UserEntity, (role) => role.permissions)
  users: UserEntity[];

  constructor(permission?: Partial<PermissionEntity>) {
    super();
    Object.assign(this, permission);
  }
}

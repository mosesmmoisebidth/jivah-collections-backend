import {
    BeforeInsert,
    Column,
    Entity,
    OneToMany,
    OneToOne,
    ManyToMany,
    JoinTable,
  } from 'typeorm';
  import { CommonEntity } from 'src/common/entities';
  import { HashHelper } from 'src/helpers';
  import { TokenEntity } from 'src/modules/tokens/model/token.entity';
  import { RoleEntity } from 'src/modules/roles/model/role.entity';
  import { PermissionEntity } from 'src/modules/permissions/model/permission.entity';
  import { UserStatus } from 'src/modules/auth/enums/user-status.enum';
  import { ERoleType } from 'src/modules/roles/enums/role.enum';
  import { CartEntity } from 'src/modules/cart/model/cart.entity';
  @Entity({ schema: 'users', name: 'users' })
  export class UserEntity extends CommonEntity {
    
    @Column({ nullable: false, unique: false })
    firstName: string;
  
    @Column({ nullable: true, unique: false })
    lastName: string;
  
    @Column({ nullable: true, unique: true })
    username: string;
  
    @Column({ nullable: false, unique: true, default: 'seller@gmail.com' })
    email: string;
  
    @Column({
      nullable: false,
    })
    password: string;

    @Column({ nullable: true })
    profilePhoto?: string;
  
    @Column({
      type: 'enum',
      enum: ERoleType,
      nullable: false,
    })
    role: ERoleType;
  
    @Column({
      type: 'enum',
      enum: UserStatus,
      default: UserStatus.Active,
      nullable: false,
    })
    status: UserStatus;
  
    @OneToMany(() => TokenEntity, (token) => token.user)
    tokens: TokenEntity[];

    @OneToOne(() => CartEntity, (cart) => cart.user)
    cart: CartEntity;
  
    @ManyToMany(() => RoleEntity, (role) => role.users, { eager: true, cascade: true })
    @JoinTable({
      schema: 'users',
      name: 'users-roles',
      joinColumn: {
        name: 'userId',
        referencedColumnName: 'id',
      },
      inverseJoinColumn: {
        name: 'roleId',
        referencedColumnName: 'id',
      },
    })
    roles: Promise<RoleEntity[]>;
  
    @ManyToMany(() => PermissionEntity, (permission) => permission.users, { eager: true, cascade: true })
    @JoinTable({
      schema: 'users',
      name: 'users-permissions',
      joinColumn: {
        name: 'userId',
        referencedColumnName: 'id',
      },
      inverseJoinColumn: {
        name: 'permissionId',
        referencedColumnName: 'id',
      },
    })
    permissions: Promise<PermissionEntity[]>;
  
    @BeforeInsert()
    async hashPassword() {
      this.password = await HashHelper.encrypt(this.password);
    }
  
    async validatePassword(password: string): Promise<boolean> {
      return await HashHelper.compare(password, this.password);
    }
  }
  
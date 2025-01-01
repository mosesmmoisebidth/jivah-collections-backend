import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { CommonEntity } from 'src/common/entities';
import { EResetPasswordStatus } from '../enums/reset-password.status';
import { UserEntity } from 'src/modules/users/model/user.entity';
@Entity({ schema: "users", name: 'reset-passwords' })
export class ResetPasswordEntity extends CommonEntity {
  @PrimaryGeneratedColumn('uuid')
  resetPasswordId: string;

  @Column({ type: 'varchar', nullable: false })
  tokenKey: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: Relation<UserEntity>;

  @Column({
    enum: EResetPasswordStatus,
    default: EResetPasswordStatus.ACTIVE,
  })
  status: EResetPasswordStatus;
}

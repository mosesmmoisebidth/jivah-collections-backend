import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Relation,
} from 'typeorm';
import { CommonEntity } from 'src/common/entities';
import { EOTPStatus } from '../enums/otp.status';
import { UserEntity } from 'src/modules/users/model/users.entity';
@Entity({ schema: 'users', name: 'otps' })
export class OTPEntity extends CommonEntity {
  @PrimaryGeneratedColumn('uuid')
  otpId: string;

  @Column({ nullable: false, type: 'int' })
  otp: number;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: Relation<UserEntity>;

  @Column({ nullable: true })
  reason: string;

  @Column({ nullable: true, default: 30 })
  validity: number;

  @Column({ nullable: false, enum: EOTPStatus, default: EOTPStatus.ACTIVE })
  status: EOTPStatus;

  isValid() {
    const otpExpiration = this.createdAt.getTime() + this.validity * 60 * 1000 * 30;
    const now = new Date().getTime();
    return now < otpExpiration;
  }
}

import { Column, Entity, JoinColumn, ManyToOne, Relation } from 'typeorm';
import { CommonEntity } from 'src/common/entities';
import { UserEntity } from 'src/modules/users/model/user.entity';

@Entity({ schema: "users", name: 'login-logs' })
export class LoginLogEntity extends CommonEntity {
  @Column({ nullable: true })
  ip: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  provider: string;

  @Column({ length: 500, nullable: true })
  ua: string;

  @Column()
  userId: string;

  @ManyToOne(() => UserEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Relation<UserEntity>;
}

import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { LoginLogEntity } from './login-log.entity';

@Injectable()
export class LoginLogRepository extends Repository<LoginLogEntity> {
  constructor(private dataSource: DataSource) {
    super(LoginLogEntity, dataSource.createEntityManager());
  }
}

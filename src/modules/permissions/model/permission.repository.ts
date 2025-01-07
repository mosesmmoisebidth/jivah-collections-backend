import { DataSource, Repository } from 'typeorm';
import { PermissionEntity } from './permission.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PermissionRepository extends Repository<PermissionEntity> {
  constructor(private dataSource: DataSource) {
    super(PermissionEntity, dataSource.createEntityManager());
  }
}

import { DataSource, Repository } from 'typeorm';
import { ProductGeneralEntity } from './product-general.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ProductGeneralRepository extends Repository<ProductGeneralEntity> {
  constructor(private dataSource: DataSource) {
    super(ProductGeneralEntity, dataSource.createEntityManager());
  }
}

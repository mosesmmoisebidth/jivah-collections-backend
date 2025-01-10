import { DataSource, Repository } from 'typeorm';
import { CartEntity } from './cart.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CartRepository extends Repository<CartEntity> {
  constructor(private dataSource: DataSource) {
    super(CartEntity, dataSource.createEntityManager());
  }
}

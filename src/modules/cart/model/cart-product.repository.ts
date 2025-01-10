import { DataSource, Repository } from 'typeorm';
import { CartProductEntity } from './cart-product.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class CartProductRepository extends Repository<CartProductEntity> {
  constructor(private dataSource: DataSource) {
    super(CartProductEntity, dataSource.createEntityManager());
  }
}

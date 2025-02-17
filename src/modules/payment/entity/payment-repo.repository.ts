import { DataSource, Repository } from 'typeorm';
import { PaymentEntity } from './payment.entity';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentRepository extends Repository<PaymentEntity> {
  constructor(private dataSource: DataSource) {
    super(PaymentEntity, dataSource.createEntityManager());
  }
}

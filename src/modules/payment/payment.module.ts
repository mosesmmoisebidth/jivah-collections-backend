import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { PaymentRepository } from './entity/payment-repo.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentEntity } from './entity/payment.entity';
@Module({
    imports: [
        TypeOrmModule.forFeature([PaymentEntity])
    ],
    controllers: [PaymentController],
    providers: [PaymentRepository, PaymentService],
    exports: [PaymentService]
})
export class PaymentModule {}
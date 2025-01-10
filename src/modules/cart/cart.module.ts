import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartProductRepository } from './model/cart-product.repository';
import { CartRepository } from './model/cart.repository';
import { CartEntity } from './model/cart.entity';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartProductEntity } from './model/cart-product.entity';
@Module({
    imports: [
        TypeOrmModule.forFeature([CartEntity, CartProductEntity])
    ],
    controllers: [CartController],
    providers: [CartService, CartRepository, CartProductRepository],
    exports: [CartRepository, CartProductRepository]
})
export class CartModule {

}
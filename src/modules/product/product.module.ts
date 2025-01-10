import { Module } from '@nestjs/common';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductGeneralRepository } from './model/product-general.repository';
import { ProductGeneralEntity } from './model/product-general.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CartRepository } from '../cart/model/cart.repository';
import { CartProductRepository } from '../cart/model/cart-product.repository';
import { CacheService } from '../caching/cache.service';
import { UserRepository } from '../users/model/users.repository';
import { CloudinaryModule } from '../cloudinary/cloudinary.module';
@Module({
    imports: [
        TypeOrmModule.forFeature([ProductGeneralEntity]),
        CloudinaryModule
    ],
    controllers: [ProductController],
    providers: [ProductService, ProductGeneralRepository, CartRepository, CartProductRepository, CacheService, UserRepository],
    exports: [ProductGeneralRepository, ProductService]
})
export class ProductModule {}
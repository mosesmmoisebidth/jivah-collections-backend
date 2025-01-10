import { ProductGeneralEntity } from "./model/product-general.entity";
import { CreateProductDto } from "./dtos/create-product.dto";
import { UpdateProductInventoryDto } from "./dtos/update-product-inventory.dto";
import { UpdateProductDto } from "./dtos/update-product.dto";
import { ProductGeneralDto } from "./dtos/product-general.dto";
import { ViewCartDto } from "./dtos/view-cart.dto";
import { PairQuantityDto } from "./dtos/pair-quantity.dto";
import { EProductQuantityStatus } from "./enums/product-status-quantity.enum";
export class ProductMapper {
    public static isValidValue(value: any): boolean {
        return value !== undefined && value !== null && value !== '' && !(typeof value === 'string' && (value.trim() === '' || value === 'string'));
    }

    public static  toCreateEntity(
        dto: CreateProductDto
    ): ProductGeneralEntity {
        const entity = new ProductGeneralEntity();
        const dtoKeys = new Set([
            'product_name', 'short_description',
            'product_description', 'regular_price',
            'sale_price', 'discount_price',
            'sale_price', 'category', 'to_date',
            'from_date', 'product_image', 'product_gallery',
            'tags', 'in_stock'
        ])
        for(const [key, value] of Object.entries(dto)){
            if(dtoKeys.has(key) && this.isValidValue(value)){
                entity[key] = value;
            }
        }
        return entity;
    }

    public static toUpdateGeneralEntity(
        entity: ProductGeneralEntity,
        dto: UpdateProductDto
    ): ProductGeneralEntity {
        for (const [key, value] of Object.entries(dto)){
            if(this.isValidValue(value)){
                entity[key] = value;
            }
        }
        return entity;
    }

    public static toUpdateEntity(
        entity: ProductGeneralEntity,
        dto: UpdateProductInventoryDto
    ): ProductGeneralEntity {
        for(const [key, value] of Object.entries(dto)){
            if(this.isValidValue(value)){
                entity[key] = value;
            }
        }
        return entity;
    }

    public static toDtoProduct(
        entity: ProductGeneralEntity
    ): ProductGeneralDto {
        const dto = new ProductGeneralDto();
        const dtoKeys = new Set([
            'product_name', 'short_description',
            'product_description', 'regular_price',
            'sale_price', 'discount_price',
            'category', 'from_date', 'to_date',
            'product_image', 'product_gallery',
            'tags', 'in_stock', 'sku', 'isbn',
            'track_stock', 'quantity', 'store_threshold',
            'quantity'
        ])
        for(const [key, value] of Object.entries(entity)){
            if(dtoKeys.has(key) && this.isValidValue(value)){
                dto[key] = value;
            }
        }
        return dto;
    }

    public static async toDtoCart(
        entity: ProductGeneralEntity
    ): Promise<ViewCartDto> {
        const dto = new ViewCartDto();
        const dtoKeys = new Set([
            'product_image', 'product_name',
            'sale_price', 'discount_price',
            'in_stock'
        ])
        for(const [key, value] of Object.entries(entity)){
            if(dtoKeys.has(key) && this.isValidValue(value)){
                dto[key] = value;
            }
        }
        return dto;
    }

    public static updatePairQuantity(
        entity: ProductGeneralEntity,
        dto: PairQuantityDto
    ): ProductGeneralEntity {
        for(const [key, value] of Object.entries(dto)){
            if(key === 'in_pair' && this.isValidValue(value) && value === EProductQuantityStatus.SINGLE){
                entity.in_pair = EProductQuantityStatus.SINGLE;
                entity.pair_quantity = 0;
                entity.quantity = 0;
                entity.store_threshold = 0;
            }else{
                entity[key] = value;
            }
        }
        return entity;
    }
}
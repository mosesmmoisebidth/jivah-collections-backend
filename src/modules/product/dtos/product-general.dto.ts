import { ApiProperty } from "@nestjs/swagger";
import { BaseDto } from "src/common/dtos/base.dto";
export class ProductGeneralDto extends BaseDto {

        @ApiProperty()
        product_name: string;
    
        @ApiProperty()
        short_description: string[];
    
        @ApiProperty()
        product_description: string[];

        @ApiProperty()
        colors: string[];
    
        @ApiProperty()
        sizes: string[];
    
        @ApiProperty()
        sale_price: number;
    
        @ApiProperty()
        discount_price: number;
    
        @ApiProperty()
        category: string[];
    
        @ApiProperty()
        from_date: string;
    
        @ApiProperty()
        to_date: string;
    
        @ApiProperty()
        product_image: string;
    
        @ApiProperty()
        product_gallery: string[];
    
        @ApiProperty()
        tags: string[];
    
        @ApiProperty()
        in_stock?: boolean;

        @ApiProperty()
        sku?: string;
        
        @ApiProperty()
        isbn?: string;
        
        @ApiProperty()
        track_stock?: boolean;
        
        @ApiProperty()
        quantity?: number;
        
        @ApiProperty()
        store_threshold?: number;
}
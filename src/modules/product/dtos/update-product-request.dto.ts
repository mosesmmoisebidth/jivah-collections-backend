import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsNumber, IsEnum, IsOptional  } from 'class-validator';
import { Transform } from 'class-transformer';
import { EProductCategory } from "../enums/product-category.enum";

export class UpdateProductRequestDto {

        @ApiProperty({
            required: false,
        })
        @IsOptional()
        @IsString()
        product_name?: string;
    
        @ApiProperty({
            required: false,
        })
        @IsOptional()
        @Transform(({ value }) => Array.isArray(value) ? value : [value])
        @IsString({ each: true })
        short_description?: string;
    
        @ApiProperty({
            required: false,
        })
        @IsOptional()
        @Transform(({ value }) => Array.isArray(value) ? value : [value])
        @IsString({ each: true })
        product_description?: string;
    
        @ApiProperty({
            required: false,
        })
        @IsOptional()
        @IsNumber()
        regular_price?: number;
    
        @ApiProperty({
            required: false,
        })
        @IsOptional()
        @IsNumber()
        sale_price?: number;
    
        @ApiProperty({
            required: false,
        })
        @IsOptional()
        @IsNumber()
        discount_price?: number;
    
        @ApiProperty({
            required: false,
            enum: Object.values(EProductCategory)
        })
        @IsOptional()
        @IsEnum(EProductCategory)
        category?: EProductCategory;
    
        @ApiProperty({
            required: false,
        })
        @IsOptional()
        @IsString()
        from_date?: string;
    
        @ApiProperty({
            required: false,
        })
        @IsOptional()
        @IsString()
        to_date?: string;
    
        @ApiProperty()
        @IsOptional()
        product_image: string;
    
        @ApiProperty()
        @IsOptional()
        @Transform(({ value }) => Array.isArray(value) ? value : [value])
        product_gallery: Express.Multer.File[];
    
        @ApiProperty()
        @IsOptional()
        @Transform(({ value }) => Array.isArray(value) ? value : [value])
        @IsString({ each: true })
        tags: string[];
    
        @ApiProperty({
            required: false
        })
        @IsOptional()
        @IsString()
        in_stock?: boolean;
    
        @ApiProperty({
            required: false
        })
        @IsOptional()
        @IsString()
        sku?: string;
    
        @ApiProperty({
            required: false 
        })
        @IsOptional()
        @IsString()
        isbn?: string;
    
        @ApiProperty({
            required: false
        })
        @IsOptional()
        @IsString()
        track_stock?: boolean;
    
        @ApiProperty({
            required: false
        })
        @IsOptional()
        @IsNumber()
        quantity?: number;
    
        @ApiProperty({
            required: false
        })
        @IsOptional()
        @IsNumber()
        store_threshold?: number;
}
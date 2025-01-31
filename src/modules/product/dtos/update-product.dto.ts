import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Transform } from "class-transformer";
import { EProductCategory } from "../enums/product-category.enum";

export class UpdateProductDto {
    
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

    @ApiProperty()
    @IsOptional()
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @IsString({ each: true })
    colors?: string[];

    @ApiProperty()
    @IsOptional()
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @IsString({ each: true })
    sizes?: string[];

    @ApiProperty({
        required: false,
    })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    sale_price?: number;

    @ApiProperty({
        required: false,
    })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    discount_price?: number;

    @ApiProperty({
        required: false,
        enum: Object.values(EProductCategory)
    })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @IsString({ each: true })
    category?: string[];

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

    @ApiProperty({
        required: false
    })
    @IsOptional()
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @IsString({ each: true })
    length?: string[];

    @ApiProperty({
        required: false
    })
    @IsOptional()
    @IsString()
    length_type?: string;

    @ApiProperty()
    @IsOptional()
    product_image?: string;

    @ApiProperty()
    @IsOptional()
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @IsString({ each: true })
    product_gallery?: string[];

    @ApiProperty()
    @IsOptional()
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @IsString({ each: true })
    tags: string[];

    @ApiProperty({
        required: false
    })
    @IsOptional()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
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
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    track_stock?: boolean;

    @ApiProperty({
        required: false
    })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    quantity?: number;

    @ApiProperty({
        required: false
    })
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    store_threshold?: number;
}
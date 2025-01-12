import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsEnum, IsBoolean } from "class-validator";
import { EProductCategory } from "../enums/product-category.enum";
export class CreateProductDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    product_name: string;

    @ApiProperty()
    @IsOptional()
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @IsString({ each: true })
    short_description: string[];

    @ApiProperty()
    @IsOptional()
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @IsString({ each: true })
    product_description: string[];

    @ApiProperty()
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    regular_price: number;

    @ApiProperty()
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    sale_price: number;

    @ApiProperty()
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    discount_price: number;

    @ApiProperty({
        required: true,
        enum: EProductCategory
    })
    @IsNotEmpty()
    @IsEnum(EProductCategory)
    category: EProductCategory;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    from_date: string;

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    to_date: string;

    @ApiProperty({
        required: false
    })
    @IsOptional()
    @IsString()
    product_image: string;

    @ApiProperty({
        required: false
    })
    @IsOptional()
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @IsString({ each: true })
    product_gallery: string[];

    @ApiProperty()
    @IsOptional()
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @IsString({ each: true })
    tags: string[];

    @ApiProperty()
    @IsNotEmpty()
    @Transform(({ value }) => value === 'true' || value === true)
    @IsBoolean()
    in_stock: boolean;


}
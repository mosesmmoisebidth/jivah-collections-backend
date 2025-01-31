import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean } from "class-validator";
export class CreateProductGeneralRequestDto {

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

    @ApiProperty({
        required: false
    })
    @IsOptional()
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @IsString({ each: true })
    colors?: string[];

    @ApiProperty({
        required: false
    })
    @IsOptional()
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @IsString({ each: true })
    sizes?: string[];

    @ApiProperty()
    @IsNotEmpty()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    sale_price: number;

    @ApiProperty()
    @IsOptional()
    @Transform(({ value }) => Number(value))
    @IsNumber()
    discount_price: number;

    @ApiProperty({
        required: true,
    })
    @Transform(({ value }) => Array.isArray(value) ? value : [value])
    @IsString({ each: true })
    category: string[];

    @ApiProperty()
    @IsOptional()
    @IsString()
    from_date: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    to_date: string;

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

    @ApiProperty({
        required: true,
        type: 'string',
        format: 'binary',
        isArray: false
    })
    @IsOptional()
    product_image: Express.Multer.File;

    @ApiProperty({
        required: true,
        type: 'string',
        format: 'binary',
        isArray: true
    })
    @IsOptional()
    product_gallery: Express.Multer.File[];

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
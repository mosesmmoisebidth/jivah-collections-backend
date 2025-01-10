import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsNumber } from 'class-validator';
export class UpdateProductInventoryDto {

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
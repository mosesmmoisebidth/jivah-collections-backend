import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';
export class UpdateProductInventoryDto {

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
    @IsNumber()
    quantity?: number;

    @ApiProperty({
        required: false
    })
    @IsOptional()
    @IsNumber()
    store_threshold?: number;

}
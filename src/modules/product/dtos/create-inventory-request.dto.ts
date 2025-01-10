import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsOptional, IsNumber } from "class-validator";
export class CreateInventoryRequestDto {

    @ApiProperty()
    @IsOptional()
    @IsString()
    sku: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    isbn: string;

    @ApiProperty()
    @IsOptional()
    @IsString()
    track_stock: string;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    quantity: number;

    @ApiProperty()
    @IsOptional()
    @IsNumber()
    store_threshold: number;

}
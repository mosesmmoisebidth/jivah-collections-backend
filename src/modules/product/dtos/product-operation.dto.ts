import { BaseDto } from "src/common/dtos/base.dto";
import { ApiProperty } from "@nestjs/swagger";

export class ProductOperation extends BaseDto {

    @ApiProperty()
    product_name: string;

    @ApiProperty()
    product_description: string[];

    @ApiProperty()
    sale_price: number;

    @ApiProperty()
    quantity: number;

    @ApiProperty()
    discount_price: number;

    @ApiProperty()
    in_stock: string;

}
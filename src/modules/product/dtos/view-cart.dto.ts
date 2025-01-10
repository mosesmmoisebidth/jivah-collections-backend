import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'src/common/dtos/base.dto';

export class ViewCartDto extends BaseDto {

    @ApiProperty()
    product_image: string;

    @ApiProperty()
    product_name: string;

    @ApiProperty()
    sale_price: number;

    @ApiProperty()
    discount_price: number;

    @ApiProperty()
    in_stock: boolean;

    @ApiProperty()
    quantity: number;

    @ApiProperty()
    sub_total: number;

}
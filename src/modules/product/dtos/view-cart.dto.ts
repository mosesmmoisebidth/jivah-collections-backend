import { ApiProperty } from '@nestjs/swagger';
import { BaseDto } from 'src/common/dtos/base.dto';
import { CartProductDto } from './product-cart.dto';
export class ViewCartDto extends BaseDto {

    @ApiProperty({ type: [CartProductDto] })
    products: CartProductDto[];

    @ApiProperty()
    sub_total: number;

}
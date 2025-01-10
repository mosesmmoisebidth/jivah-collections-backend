import { Controller } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";

@Controller({
    path: 'cart',
    version: '1'
})
@ApiTags('cart')
export class CartController {

}
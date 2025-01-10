import { ViewCartDto } from "./view-cart.dto";
import { ApiProperty } from "@nestjs/swagger";
export class ViewCartResponseDto {

    @ApiProperty({ type: ViewCartDto })
    cart: ViewCartDto;
    
}
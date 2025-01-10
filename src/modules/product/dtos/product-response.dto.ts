import { ProductGeneralDto } from "./product-general.dto";
import { ApiProperty } from "@nestjs/swagger";
export class ProductResponseDto {

    @ApiProperty({ type: ProductGeneralDto })
    product: ProductGeneralDto;
    
}
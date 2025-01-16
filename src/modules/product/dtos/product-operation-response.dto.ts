import { ApiProperty } from "@nestjs/swagger";
import { ProductOperation } from "./product-operation.dto";
export class ProductOperationResponseDto {

    @ApiProperty({ type: ProductOperation })
    product: ProductOperation;
    
}
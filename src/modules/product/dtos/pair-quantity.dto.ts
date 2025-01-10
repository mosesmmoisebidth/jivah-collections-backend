import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNotEmpty, IsString } from 'class-validator';

export class PairQuantityDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    in_pair: boolean;

    @ApiProperty()
    @IsNotEmpty()
    @IsNumber()
    pair_quantity: number; 
}
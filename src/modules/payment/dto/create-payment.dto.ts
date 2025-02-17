import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class CreatePaymentDto {

    @ApiProperty()
    @IsOptional()
    @IsString()
    transaction_id

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    merchant_code

    @ApiProperty()
    @IsOptional()
    @IsString()
    payer_code

    @ApiProperty()
    @IsOptional()
    @IsString()
    academic_year

    @ApiProperty()
    @IsOptional()
    @IsString()
    payment_channel

    @ApiProperty()
    @IsOptional()
    @IsString()
    payment_channel_name

    @ApiProperty()
    @IsOptional()
    @IsString()
    bank_name

    @ApiProperty()
    @IsOptional()
    @IsString()
    bank_account

    @ApiProperty()
    @IsOptional()
    @IsString()
    payment_purpose

    @ApiProperty()
    @IsOptional()
    @IsString()
    amount

    @ApiProperty()
    @IsOptional()
    @IsString()
    currency

    @ApiProperty()
    @IsOptional()
    @IsString()
    term

    @ApiProperty()
    @IsOptional()
    @IsString()
    observation

    @ApiProperty()
    @IsOptional()
    @IsString()
    initial_slip_number

    @ApiProperty()
    @IsOptional()
    @IsString()
    slip_number

}
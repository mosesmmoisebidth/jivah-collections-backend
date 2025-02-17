import { ApiProperty } from "@nestjs/swagger";
export class PaymentResponseDto {

        @ApiProperty()
        transaction_id: string;
    
        @ApiProperty()
        merchant_code: string;
    
        @ApiProperty()
        payer_code: string;
    
        @ApiProperty()
        academic_year:string;
    
        @ApiProperty()
        payment_channel: string;
    
        @ApiProperty()
        payment_channel_name: string;
    
        @ApiProperty()
        bank_name:string;
    
        @ApiProperty()
        bank_account: string;
    
        @ApiProperty()
        payment_purpose: string;
    
        @ApiProperty()
        amount: number;
    
        @ApiProperty()
        currency: string;
    
        @ApiProperty()
        term: string;
    
        @ApiProperty()
        observation: string;
    
        @ApiProperty()
        initial_slip_number: string;
    
        @ApiProperty()
        slip_number: string;

}

import { Injectable } from '@nestjs/common';
import { PaymentRepository } from './entity/payment-repo.repository';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { ResponseDto } from 'src/common/dtos';
import { ResponseService } from 'src/shared/response/response.service';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { CustomException } from 'src/common/http/exceptions/custom.exception';

@Injectable()
export class PaymentService {

    constructor(
        private readonly paymentRepository: PaymentRepository,
        private readonly responseService: ResponseService
    ){}

    async createPayment(
        dto: CreatePaymentDto
    ): Promise<ResponseDto<PaymentResponseDto>> {
        try{
            const payment = this.paymentRepository.create(dto);
            const paymentResponse = await this.paymentRepository.save(payment);
            const response = new PaymentResponseDto();
            response.transaction_id = paymentResponse.transaction_id;
            response.merchant_code = paymentResponse.merchant_code;
            response.payer_code = paymentResponse.payer_code;
            response.academic_year = paymentResponse.academic_year;
            response.payment_channel = paymentResponse.payment_channel;
            response.payment_channel_name = paymentResponse.payment_channel_name;
            response.bank_name = paymentResponse.bank_name;
            response.bank_account = paymentResponse.bank_account;
            response.payment_purpose = paymentResponse.payment_purpose;
            response.amount = paymentResponse.amount;
            response.currency = paymentResponse.currency;
            response.term = paymentResponse.term;
            response.observation = paymentResponse.observation;
            response.initial_slip_number = paymentResponse.initial_slip_number;
            response.slip_number = paymentResponse.slip_number;

            return this.responseService.makeResponse({
                message: `Payment initiated successfully`,
                payload: response
            })
        }catch(error){
            throw new CustomException(error);
        }
    }
}
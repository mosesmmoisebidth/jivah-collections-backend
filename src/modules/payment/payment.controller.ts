import { ApiTags } from '@nestjs/swagger';
import { Controller, Body, ValidationPipe, Post } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ApiOperation } from '@nestjs/swagger';
import { ApiUnauthorizedCustomResponse } from 'src/common/decorators/api-unauthorized-custom-response.decorator';
import { ApiForbiddenCustomResponse } from 'src/common/decorators/api-forbidden-custom-response.decorator';
import { NullDto } from 'src/common/dtos/null.dto';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { PaymentResponseDto } from './dto/payment-response.dto';
import { ResponseDto } from 'src/common/dtos';
import { ApiBearerAuth } from '@nestjs/swagger';
import { TOKEN_NAME } from 'src/constants';

@ApiTags('payment')
@Controller({
    path: 'payment',
    version: '1'
})
export class PaymentController {

    constructor(
        private readonly paymentService: PaymentService
    ){}

    @ApiOperation({ description: 'initiate payment' })
    @ApiUnauthorizedCustomResponse(NullDto)
    @ApiForbiddenCustomResponse(NullDto)
    @ApiBearerAuth(TOKEN_NAME)
    @Post('payment/initiate')
    async createPayment(
        @Body(ValidationPipe) dto: CreatePaymentDto
    ): Promise<ResponseDto<PaymentResponseDto>> {
        return this.paymentService.createPayment(dto);
    }
}

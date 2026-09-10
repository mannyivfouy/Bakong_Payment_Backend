import { Body, Controller, Get, Post } from '@nestjs/common';
import { PaymentService } from './payment.service.js';
import { CreatePaymentDTO } from './dto/craete-payment.dto.js';

@Controller('payment')
export class PaymentController {
  constructor(private paymentService: PaymentService) {}

  @Post('khqr')
  createPayment(@Body() dto: CreatePaymentDTO) {
    return this.paymentService.createPayment(dto);
  }

  @Post('check')
  checkPaymetn(@Body('md5') md5: string){
    return this.paymentService.checkPayment(md5)
  }
}

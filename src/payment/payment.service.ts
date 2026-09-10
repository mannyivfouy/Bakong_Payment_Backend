import { Injectable } from '@nestjs/common';
import { CreatePaymentDTO } from './dto/craete-payment.dto.js';
import { BakongService } from './bakong.service.js';

@Injectable()
export class PaymentService {
  constructor(private readonly bakongService: BakongService) {}

  createPayment(dto: CreatePaymentDTO) {
    const billNumber = `PAY-${Date.now()}`;

    return this.bakongService.generateKHQR(dto.amount, billNumber);
  }

  checkPayment(md5: string){
    return this.bakongService.checkPayment(md5)
  }
}

import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller.js';
import { PaymentService } from './payment.service.js';
import { BakongService } from './bakong.service.js';

@Module({
  controllers: [PaymentController],
  providers: [PaymentService, BakongService],
})
export class PaymentModule {}

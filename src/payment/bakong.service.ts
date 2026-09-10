import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createRequire } from 'node:module';

@Injectable()
export class BakongService {
  private readonly khqr: any;
  private readonly khqrData: any;
  private readonly MerchantInfo: any;

  constructor(private readonly configService: ConfigService) {
    const require = createRequire(import.meta.url);

    const { BakongKHQR, khqrData, MerchantInfo } = require('bakong-khqr');

    this.khqr = new BakongKHQR();
    this.khqrData = khqrData;
    this.MerchantInfo = MerchantInfo;
  }

  generateKHQR(amount: number, billNumber: string) {
    const expiryMinutes =
      this.configService.get<number>('KHQR_EXPIRY_MINUTES') ?? 10;

    const expirationTimestamp = Date.now() + expiryMinutes * 60 * 1000;

    const merchantInfo = new this.MerchantInfo(
      this.configService.get<string>('BAKONG_ACCOUNT_ID'),
      this.configService.get<string>('BAKONG_MERCHANT_NAME'),
      this.configService.get<string>('BAKONG_MERCHANT_CITY'),
      this.configService.get<string>('BAKONG_MERCHANT_ID'),
      this.configService.get<string>('BAKONG_ACQUIRING_BANK'),
      {
        currency: this.khqrData.currency.usd,
        amount,
        merchantCategoryCode: '5999',
        billNumber,
        expirationTimestamp,
      },
    );

    const payment = this.khqr.generateMerchant(merchantInfo);

    return {
      ...payment,
      data: {
        ...payment.data,
        amount,
        currency: 'USD',
        expiresAt: new Date(expirationTimestamp).toISOString(),
      },
    };
  }

  async checkPayment(md5: string) {
    const accessToken = this.configService.get<string>('BAKONG_ACCESS_TOKEN');

    const response = await fetch(
      'https://api-bakong.nbc.gov.kh/v1/check_transaction_by_md5',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          md5,
        }),
      },
    );

    const result = await response.json();

    if (result.responseCode !== 0 || !result.data) {
      return {
        paid: false,
        transaction: null,
      };
    }

    return {
      paid: true,
      transaction: {
        hash: result.data.hash,
        externalRef: result.data.externalRef,
        fromAccountId: result.data.fromAccountId,
        toAccountId: result.data.toAccountId,
        currency: result.data.currency,
        amount: result.data.amount,
        createdDateMs: result.data.createdDateMs,
        acknowledgedDateMs: result.data.acknowledgedDateMs,
      },
    };
  }
}

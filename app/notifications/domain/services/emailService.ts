import { LoggerService } from '../../../common';
import { OrderCreatedData } from './types';

export class EmailService {
  public constructor(private readonly loggerService: LoggerService) {}

  public async sendOrderCreatedEmail(orderData: OrderCreatedData): Promise<void> {
    this.loggerService.debug('Sending email about created order...', { ...orderData });

    console.log('email body to send', emailBody);

    this.loggerService.info('Email about created order send.');
  }
}

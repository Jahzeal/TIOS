import { Controller, Get, Post, Body, Headers, Req, Param, Query, RawBodyRequest, Inject } from '@nestjs/common';
import { Request } from 'express';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(@Inject(PaymentsService) private readonly paymentsService: PaymentsService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.paymentsService.findAll({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      status,
    });
  }

  @Post('create-checkout')
  createCheckout(
    @Body() body: { tenantId?: string; tenantName?: string; amount: number; phone: string },
  ) {
    return this.paymentsService.createCheckoutLink(body);
  }

  @Post('simulate-webhook/:id')
  simulateWebhook(@Param('id') id: string) {
    return this.paymentsService.simulateWebhook(id);
  }

  @Post('webhook')
  handleWebhook(
    @Headers('stripe-signature') signature: string,
    @Req() req: RawBodyRequest<Request>,
  ) {
    const rawBody = req.rawBody || Buffer.from(JSON.stringify(req.body));
    return this.paymentsService.handleStripeWebhook(signature || '', rawBody);
  }
}

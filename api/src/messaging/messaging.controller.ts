import { Controller, Get, Post, Body, Query, Inject } from '@nestjs/common';
import { MessagingService } from './messaging.service';

@Controller('messaging')
export class MessagingController {
  constructor(@Inject(MessagingService) private readonly messagingService: MessagingService) {}

  @Get('sms')
  getSmsLogs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.messagingService.getSmsLogs({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      status,
    });
  }

  @Get('reminders')
  getReminders(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.messagingService.getReminders({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      status,
    });
  }

  @Post('send-sms')
  sendSms(@Body() body: { tenantId?: string; tenantName?: string; phone: string; message: string }) {
    return this.messagingService.sendSms(body);
  }
}

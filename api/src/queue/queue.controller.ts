import { Controller, Get, Post, Param, Query, Inject } from '@nestjs/common';
import { QueueService } from './queue.service';

@Controller('job-queue')
export class QueueController {
  constructor(@Inject(QueueService) private readonly queueService: QueueService) {}

  @Get()
  getJobs(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
  ) {
    return this.queueService.getJobs({
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? parseInt(limit, 10) : 10,
      search,
      status,
    });
  }

  @Post('retry/:id')
  retryJob(@Param('id') id: string) {
    return this.queueService.retryJob(id);
  }
}

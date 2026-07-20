import { Controller, Get, Query, Inject } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(@Inject(DashboardService) private readonly dashboardService: DashboardService) {}

  @Get('stats')
  getStats() {
    return this.dashboardService.getStats();
  }

  @Get('recent-calls')
  getRecentCalls(@Query('limit') limit?: string) {
    return this.dashboardService.getRecentCalls(limit ? parseInt(limit, 10) : 5);
  }
}

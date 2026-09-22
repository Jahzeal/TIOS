import { Controller, Get, Query, Headers, Inject } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { AuthService } from '../auth/auth.service';

@Controller('dashboard')
export class DashboardController {
  constructor(
    @Inject(DashboardService) private readonly dashboardService: DashboardService,
    @Inject(AuthService) private readonly authService: AuthService,
  ) {}

  @Get('stats')
  async getStats(
    @Headers('authorization') authHeader?: string,
    @Query('tenantId') tenantId?: string,
  ) {
    const user = this.extractUser(authHeader);
    return this.dashboardService.getStats(tenantId, user?.userId);
  }

  @Get('recent-calls')
  async getRecentCalls(
    @Headers('authorization') authHeader?: string,
    @Query('tenantId') tenantId?: string,
    @Query('limit') limit?: string,
  ) {
    const user = this.extractUser(authHeader);
    return this.dashboardService.getRecentCalls(
      limit ? parseInt(limit, 10) : 5,
      tenantId,
      user?.userId,
    );
  }

  private extractUser(authHeader?: string) {
    if (!authHeader?.startsWith('Bearer ')) return null;
    const token = authHeader.substring(7);
    return this.authService.validateToken(token);
  }
}

import { Controller, Get, Inject, Optional } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Controller('api')
export class AppController {
  constructor(@Optional() @Inject(ConfigService) private readonly configService?: ConfigService) {}

  @Get('status')
  getStatus() {
    const apiKey = this.configService?.get<string>('FIRECRAWL_API_KEY') || process.env.FIRECRAWL_API_KEY || '';
    const isMock =
      !apiKey || apiKey.trim() === '' || apiKey.startsWith('YOUR_');
    return {
      isMockMode: isMock,
      status: 'healthy',
      time: new Date().toISOString(),
    };
  }
}

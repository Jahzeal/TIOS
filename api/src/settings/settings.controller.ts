import { Controller, Get, Put, Post, Param, Body, Inject } from '@nestjs/common';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(@Inject(SettingsService) private readonly settingsService: SettingsService) {}

  @Get('agents')
  listAgents() {
    return this.settingsService.listAgents();
  }

  @Get('agent/:id')
  getAgent(@Param('id') id: string) {
    return this.settingsService.getAgent(id);
  }

  @Put('agent/:id')
  updateAgent(@Param('id') id: string, @Body() body: any) {
    return this.settingsService.updateAgent(id, body);
  }

  @Post('prompt-test')
  testPrompt(@Body() body: { systemPrompt: string; userMessage: string }) {
    return this.settingsService.testPrompt(body.systemPrompt, body.userMessage);
  }
}

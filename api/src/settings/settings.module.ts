import { Module } from '@nestjs/common';
import { SettingsController } from './settings.controller';
import { SettingsService } from './settings.service';
import { AiModule } from '../services/ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [SettingsController],
  providers: [SettingsService],
})
export class SettingsModule {}

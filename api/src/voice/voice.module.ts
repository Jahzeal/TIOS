import { Module } from '@nestjs/common';
import { VoiceController } from './voice.controller';
import { VoiceService } from './voice.service';
import { VoiceGateway } from './voice.gateway';
import { AiModule } from '../services/ai/ai.module';

@Module({
  imports: [AiModule],
  controllers: [VoiceController],
  providers: [VoiceService, VoiceGateway],
})
export class VoiceModule {}

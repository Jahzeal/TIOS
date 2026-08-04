import { Module } from '@nestjs/common';
import { VoiceController } from './voice.controller';
import { VoiceService } from './voice.service';
import { VoiceGateway } from './voice.gateway';
import { AiModule } from '../services/ai/ai.module';
import { PaymentsModule } from '../payments/payments.module';

@Module({
  imports: [AiModule, PaymentsModule],
  controllers: [VoiceController],
  providers: [VoiceService, VoiceGateway],
})
export class VoiceModule {}

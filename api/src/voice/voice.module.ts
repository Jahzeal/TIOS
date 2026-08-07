import { Module } from '@nestjs/common';
import { VoiceController } from './voice.controller';
import { VoiceService } from './voice.service';
import { VoiceGateway } from './voice.gateway';
import { WebVoiceGateway } from './web-voice.gateway';
import { VoicePromptBuilderService } from './voice-prompt-builder.service';
import { VoiceActionHandlerService } from './voice-action-handler.service';
import { AiModule } from '../services/ai/ai.module';
import { PaymentsModule } from '../payments/payments.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [AiModule, PaymentsModule, QueueModule],
  controllers: [VoiceController],
  providers: [VoiceService, VoiceGateway, WebVoiceGateway, VoicePromptBuilderService, VoiceActionHandlerService],
})
export class VoiceModule {}

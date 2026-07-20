import { Module } from '@nestjs/common';
import { OpenAiService } from './openai.service';
import { DeepgramService } from './deepgram.service';
import { ElevenLabsService } from './elevenlabs.service';

@Module({
  providers: [OpenAiService, DeepgramService, ElevenLabsService],
  exports: [OpenAiService, DeepgramService, ElevenLabsService],
})
export class AiModule {}

import { Injectable } from '@nestjs/common';
import { createClient } from '@deepgram/sdk';
import { config } from '../../config';

@Injectable()
export class DeepgramService {
  public createDeepgramLiveStream() {
    if (!config.deepgramApiKey) {
      console.warn('[DeepgramService] DEEPGRAM_API_KEY is missing. Operating in simulation mode.');
      return null;
    }

    try {
      const deepgram = createClient(config.deepgramApiKey);
      return deepgram.listen.live({
        model: 'nova-2-phonecall',
        encoding: 'mulaw',
        sample_rate: 8000,
        channels: 1,
        interim_results: true,
        endpointing: 300,
      });
    } catch (err) {
      console.error('[DeepgramService] Failed to create Deepgram stream:', err);
      return null;
    }
  }
}

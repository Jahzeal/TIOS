import { Injectable } from '@nestjs/common';
import { createClient } from '@deepgram/sdk';
import { config } from '../../config';

@Injectable()
export class DeepgramService {
  public createDeepgramLiveStream(isWeb: boolean = false) {
    if (!config.deepgramApiKey) {
      console.warn('[DeepgramService] DEEPGRAM_API_KEY is missing. Operating in simulation mode.');
      return null;
    }

    try {
      const deepgram = createClient(config.deepgramApiKey);
      if (isWeb) {
        return deepgram.listen.live({
          model: 'nova-2',
          smart_format: true,
          interim_results: true,
          punctuate: true,
          endpointing: 200,
        });
      }
      return deepgram.listen.live({
        model: 'nova-2',
        encoding: 'mulaw',
        sample_rate: 8000,
        channels: 1,
        smart_format: true,
        interim_results: true,
        punctuate: true,
        endpointing: 200,
      });
    } catch (err) {
      console.error('[DeepgramService] Failed to create Deepgram stream:', err);
      return null;
    }
  }

  public async generateTtsAudio(text: string): Promise<Buffer | null> {
    if (!config.deepgramApiKey) return null;
    try {
      const response = await fetch('https://api.deepgram.com/v1/speak?model=aura-asteria-en&encoding=mulaw&sample_rate=8000', {
        method: 'POST',
        headers: {
          Authorization: `Token ${config.deepgramApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer();
        return Buffer.from(arrayBuffer);
      } else {
        console.warn(`[Deepgram TTS] HTTP ${response.status} ${response.statusText}`);
      }
    } catch (err) {
      console.error('[Deepgram TTS Error]:', err);
    }
    return null;
  }
}

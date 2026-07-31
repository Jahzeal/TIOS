import { Injectable } from '@nestjs/common';
import { WebSocket } from 'ws';
import { config } from '../../config';

export class SpeechSession {
  private ws: WebSocket;
  private streamSid: string;
  private voiceId: string;
  private sentenceQueue: string[] = [];
  private isPlaying = false;
  private currentCancellation = { cancelled: false };

  constructor(ws: WebSocket, streamSid: string, voiceId: string) {
    this.ws = ws;
    this.streamSid = streamSid;
    this.voiceId = voiceId;
  }

  public enqueueSentence(sentence: string) {
    this.sentenceQueue.push(sentence);
    this.processQueue();
  }

  public interrupt() {
    this.currentCancellation.cancelled = true;
    this.sentenceQueue = [];
    this.isPlaying = false;
    this.currentCancellation = { cancelled: false };

    try {
      this.ws.send(
        JSON.stringify({
          event: 'clear',
          streamSid: this.streamSid,
        }),
      );
    } catch (e) {
      console.error('[SpeechSession] Failed to send clear message:', e);
    }
    console.log(`[Interruption Engine] Flushed audio buffer for stream ${this.streamSid}`);
  }

  private async processQueue() {
    if (this.isPlaying || this.sentenceQueue.length === 0) return;

    this.isPlaying = true;
    this.currentCancellation = { cancelled: false };

    while (this.sentenceQueue.length > 0) {
      const sentence = this.sentenceQueue.shift();
      if (!sentence) continue;

      if (this.currentCancellation.cancelled) break;

      await this.speak(sentence, this.currentCancellation);
    }

    this.isPlaying = false;
  }

  private async speak(text: string, cancellation: { cancelled: boolean }) {
    if (!config.elevenLabsApiKey) {
      console.log(`[ElevenLabs Simulation] Speaking: "${text}"`);
      const words = text.split(' ').length;
      const durationMs = Math.max(1000, words * 250);
      for (let i = 0; i < durationMs; i += 100) {
        if (cancellation.cancelled) break;
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      return;
    }

    try {
      const activeVoiceId = !this.voiceId || this.voiceId === '21m00Tcm4TlvDq8ikWAM' ? 'EXAVITQu4vr4xnSDxMaL' : this.voiceId;
      const response = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${activeVoiceId}/stream?output_format=ulaw_8000&optimize_streaming_latency=4`,
        {
          method: 'POST',
          headers: {
            'xi-api-key': config.elevenLabsApiKey,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            text: text,
            model_id: 'eleven_flash_v2_5',
            voice_settings: {
              stability: 0.4,
              similarity_boost: 0.75,
            },
          }),
        },
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[TTS Error] ElevenLabs status ${response.status} (${response.statusText}):`, errorText);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      while (true) {
        if (cancellation.cancelled) {
          break;
        }

        const { done, value } = await reader.read();
        if (done) break;

        if (value) {
          const base64Audio = Buffer.from(value).toString('base64');
          this.ws.send(
            JSON.stringify({
              event: 'media',
              streamSid: this.streamSid,
              media: {
                payload: base64Audio,
              },
            }),
          );
        }
      }
    } catch (err) {
      console.error('[TTS] ElevenLabs audio playback error:', err);
    }
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

@Injectable()
export class ElevenLabsService {
  public createSpeechSession(ws: WebSocket, streamSid: string, voiceId: string): SpeechSession {
    return new SpeechSession(ws, streamSid, voiceId);
  }
}

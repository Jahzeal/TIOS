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
  private currentEpoch = 0;

  constructor(ws: WebSocket, streamSid: string, voiceId: string) {
    this.ws = ws;
    this.streamSid = streamSid;
    this.voiceId = voiceId;
  }

  public enqueueSentence(sentence: string) {
    const clean = (sentence || '')
      .replace(/\[ACTION:[A_Z0-9_]+\]/gi, '')
      .replace(/action\s+(send|request)\s+\w+/gi, '')
      .trim();
    if (!clean) return;
    this.sentenceQueue.push(clean);
    this.processQueue();
  }

  public interrupt() {
    console.log(`[Interruption Engine] Interrupting stream ${this.streamSid} (Epoch: ${this.currentEpoch})`);
    this.currentCancellation.cancelled = true;
    this.currentEpoch++;
    this.sentenceQueue = [];
    this.isPlaying = false;

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
  }

  private async processQueue() {
    if (this.isPlaying || this.sentenceQueue.length === 0) return;

    this.isPlaying = true;
    this.currentCancellation = { cancelled: false };
    const activeEpoch = this.currentEpoch;

    while (this.sentenceQueue.length > 0) {
      const sentence = this.sentenceQueue.shift();
      if (!sentence) continue;

      if (this.currentCancellation.cancelled || activeEpoch !== this.currentEpoch) break;

      await this.speak(sentence, this.currentCancellation, activeEpoch);
    }

    this.isPlaying = false;
  }

  private async speak(text: string, cancellation: { cancelled: boolean }, epoch: number) {
    if (!config.elevenLabsApiKey) {
      console.log(`[ElevenLabs Simulation] Speaking: "${text}"`);
      const words = text.split(' ').length;
      const durationMs = Math.max(1000, words * 250);
      for (let i = 0; i < durationMs; i += 100) {
        if (cancellation.cancelled || epoch !== this.currentEpoch) break;
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
        console.warn(`[TTS Error] ElevenLabs status ${response.status} (${response.statusText}):`, errorText);
        console.log('[TTS Engine] Automatically falling back to Deepgram Aura TTS...');
        await this.fallbackDeepgramTts(text, cancellation, epoch);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) return;

      while (true) {
        if (cancellation.cancelled || epoch !== this.currentEpoch) {
          try {
            reader.cancel().catch(() => {});
          } catch (e) {}
          break;
        }

        const { done, value } = await reader.read();
        if (done) break;

        if (cancellation.cancelled || epoch !== this.currentEpoch) {
          try {
            reader.cancel().catch(() => {});
          } catch (e) {}
          break;
        }

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
      await this.fallbackDeepgramTts(text, cancellation, epoch);
    }
  }

  private async fallbackDeepgramTts(text: string, cancellation: { cancelled: boolean }, epoch: number) {
    if (!config.deepgramApiKey) {
      console.warn('[Deepgram TTS Fallback] DEEPGRAM_API_KEY is missing.');
      return;
    }
    console.log(`[Deepgram Aura TTS] Generating audio for: "${text}"`);
    try {
      const dgRes = await fetch('https://api.deepgram.com/v1/speak?model=aura-asteria-en&encoding=mulaw&sample_rate=8000', {
        method: 'POST',
        headers: {
          Authorization: `Token ${config.deepgramApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text }),
      });

      if (dgRes.ok) {
        const arrayBuf = await dgRes.arrayBuffer();
        const audioBuf = Buffer.from(arrayBuf);

        if (cancellation.cancelled || epoch !== this.currentEpoch) return;

        const CHUNK_SIZE = 1600;
        for (let offset = 0; offset < audioBuf.length; offset += CHUNK_SIZE) {
          if (cancellation.cancelled || epoch !== this.currentEpoch) break;
          const chunk = audioBuf.subarray(offset, offset + CHUNK_SIZE);
          const base64Audio = chunk.toString('base64');
          this.ws.send(
            JSON.stringify({
              event: 'media',
              streamSid: this.streamSid,
              media: { payload: base64Audio },
            }),
          );
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
      } else {
        const errBody = await dgRes.text();
        console.error(`[Deepgram TTS Fallback Failed] HTTP ${dgRes.status}:`, errBody);
      }
    } catch (err) {
      console.error('[Deepgram TTS Fallback Error]:', err);
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
